import express from 'express';
import { PrismaClient } from '../generated/prisma/index.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const prisma = new PrismaClient();
const router = express.Router();

// candidate's own CVs
router.get('/', requireAuth, async (req, res) => {
  const cvs = await prisma.cV.findMany({
    where: { userId: req.user.userId },
    include: { position: true },
  });
  res.json(cvs);
});

// create a CV for a position
router.post('/', requireAuth, async (req, res) => {
  const { positionId } = req.body;

  const position = await prisma.position.findUnique({
    where: { id: positionId },
    include: { accessRules: { include: { attribute: true } } },
  });

  if (!position) return res.status(404).json({ error: 'Position not found' });

  // check every access rule against this candidate's attribute values
  for (const rule of position.accessRules) {
    const userValue = await prisma.attributeValue.findUnique({
      where: { userId_attributeId: { userId: req.user.userId, attributeId: rule.attributeId } },
    });

    const passes = checkRule(rule, userValue?.value);
    if (!passes) {
      return res.status(403).json({
        error: `You don't meet the requirement for "${rule.attribute.name}"`,
      });
    }
  }

  const cv = await prisma.cV.create({
    data: { userId: req.user.userId, positionId },
  });

  res.status(201).json(cv);
});

function checkRule(rule, actualValue) {
  if (actualValue === undefined) return false; // never filled in, can't pass any rule

  switch (rule.operator) {
    case 'gt': return Number(actualValue) > Number(rule.value);
    case 'lt': return Number(actualValue) < Number(rule.value);
    case 'eq': return actualValue === rule.value;
    default: return false;
  }
}

// get one CV, fully assembled from profile values + projects
router.get('/:id', requireAuth, async (req, res) => {
  const cv = await prisma.cV.findUnique({
    where: { id: Number(req.params.id) },
    include: { position: { include: { attributes: { include: { attribute: true } } } }, user: true },
  });
  if (!cv) return res.status(404).json({ error: 'CV not found' });

  // access control: candidates can only see their own CV; recruiters only published ones; admins see everything
  const isOwner = cv.userId === req.user.userId;
  const isAdmin = req.user.role === 'admin';
  const isRecruiter = req.user.role === 'recruiter';

  if (!isOwner && !isAdmin) {
    if (!isRecruiter || cv.status !== 'published') {
      return res.status(403).json({ error: 'You do not have access to this CV' });
    }
  }

  // pull the CV owner's saved values for exactly the attributes this position needs
  const attributeIds = cv.position.attributes.map((a) => a.attributeId);
  const values = await prisma.attributeValue.findMany({
    where: { userId: cv.userId, attributeId: { in: attributeIds } },
  });

  const valueMap = Object.fromEntries(values.map((v) => [v.attributeId, v]));

  const fields = cv.position.attributes.map((posAttr) => ({
    attributeId: posAttr.attributeId,
    name: posAttr.attribute.name,
    type: posAttr.attribute.type,
    options: posAttr.attribute.options,
    value: valueMap[posAttr.attributeId]?.value ?? '',
    version: valueMap[posAttr.attributeId]?.version ?? null,
  }));

  const projects = await prisma.project.findMany({
    where: {
      userId: cv.userId,
      tags: cv.position.projectTags.length ? { hasSome: cv.position.projectTags } : undefined,
    },
    orderBy: { startDate: 'desc' },
    take: cv.position.maxProjects,
  });

  const likeCount = await prisma.cVLike.count({ where: { cvId: cv.id } });
  const userLiked = await prisma.cVLike.findUnique({
    where: { cvId_recruiterId: { cvId: cv.id, recruiterId: req.user.userId } },
  }).catch(() => null);

  res.json({ ...cv, fields, projects, likeCount, userLiked: !!userLiked });
});

// edit a single attribute value in-place, writes through to the shared profile value
router.put('/:id/attributes/:attributeId', requireAuth, async (req, res) => {
  const cv = await prisma.cV.findUnique({ where: { id: Number(req.params.id) } });
  if (!cv) return res.status(404).json({ error: 'CV not found' });

  const isOwner = cv.userId === req.user.userId;
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    return res.status(403).json({ error: 'Only the candidate or an admin can edit this' });
  }

  const targetUserId = cv.userId; // always the CV owner's profile, never the requester's
  const attributeId = Number(req.params.attributeId);
  const { value, version } = req.body;

  const existing = await prisma.attributeValue.findUnique({
    where: { userId_attributeId: { userId: targetUserId, attributeId } },
  });

  if (!existing) {
    const created = await prisma.attributeValue.create({
      data: { userId: targetUserId, attributeId, value },
    });
    return res.json(created);
  }

  const result = await prisma.attributeValue.updateMany({
    where: { userId: targetUserId, attributeId, version },
    data: { value, version: { increment: 1 } },
  });

  if (result.count === 0) {
    return res.status(409).json({ error: 'This value was changed elsewhere. Please reload.' });
  }

  res.json({ success: true });
});

// publish, only if every field is filled
router.post('/:id/publish', requireAuth, async (req, res) => {
  const cv = await prisma.cV.findUnique({
    where: { id: Number(req.params.id) },
    include: { position: { include: { attributes: true } } },
  });
  if (!cv) return res.status(404).json({ error: 'CV not found' });

  const attributeIds = cv.position.attributes.map((a) => a.attributeId);
  const values = await prisma.attributeValue.findMany({
    where: { userId: cv.userId, attributeId: { in: attributeIds } },
  });

  const allFilled = attributeIds.every((id) =>
    values.some((v) => v.attributeId === id && v.value?.trim())
  );

  if (!allFilled) {
    return res.status(400).json({ error: 'All fields must be filled before publishing' });
  }

  await prisma.cV.update({ where: { id: cv.id }, data: { status: 'published' } });
  res.json({ success: true });
});

// recruiters/admins browse all published cvs across all candidates
router.get('/all/published', requireAuth, requireRole('recruiter', 'admin'), async (req, res) => {
  const cvs = await prisma.cV.findMany({
    where: { status: 'published' },
    include: { position: true, user: true, likes: true },
    orderBy: { createdAt: 'desc' },
  });

  const result = cvs.map((cv) => ({
    ...cv,
    likeCount: cv.likes.length,
  }));

  res.json(result);
});

export default router;