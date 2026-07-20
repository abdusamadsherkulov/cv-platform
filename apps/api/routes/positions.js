import express from 'express';
import { PrismaClient } from '../generated/prisma/index.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const prisma = new PrismaClient();
const router = express.Router();

// anyone logged in can browse positions
router.get('/', requireAuth, async (req, res) => {
  const positions = await prisma.position.findMany({
    include: {
      attributes: { include: { attribute: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(positions);
});

// get one position with full detail
router.get('/:id', requireAuth, async (req, res) => {
  const position = await prisma.position.findUnique({
    where: { id: Number(req.params.id) },
    include: {
      attributes: { include: { attribute: true } },
      accessRules: { include: { attribute: true } },
    },
  });
  if (!position) return res.status(404).json({ error: 'Position not found' });
  res.json(position);
});

// create a position with selected attributes
router.post('/', requireAuth, requireRole('recruiter', 'admin'), async (req, res) => {
  const { title, description, attributeIds, projectTags, maxProjects } = req.body;

  const position = await prisma.position.create({
    data: {
      title,
      description,
      projectTags: projectTags || [],
      maxProjects: maxProjects || 3,
      attributes: {
        create: (attributeIds || []).map((attributeId) => ({ attributeId })),
      },
    },
    include: { attributes: { include: { attribute: true } } },
  });

  res.status(201).json(position);
});

// delete a position
router.delete('/:id', requireAuth, requireRole('recruiter', 'admin'), async (req, res) => {
  await prisma.position.delete({ where: { id: Number(req.params.id) } });
  res.status(204).send();
});

// edit a position, with optimistic locking
router.put('/:id', requireAuth, requireRole('recruiter', 'admin'), async (req, res) => {
  const id = Number(req.params.id);
  const { title, description, projectTags, maxProjects, version } = req.body;

  const result = await prisma.position.updateMany({
    where: { id, version },
    data: { title, description, projectTags, maxProjects, version: { increment: 1 } },
  });

  if (result.count === 0) {
    return res.status(409).json({ error: 'This position was changed by someone else. Please reload.' });
  }

  res.json({ success: true });
});

// add an attribute to an existing position
router.post('/:id/attributes', requireAuth, requireRole('recruiter', 'admin'), async (req, res) => {
  const positionId = Number(req.params.id);
  const { attributeId } = req.body;

  const link = await prisma.positionAttribute.create({
    data: { positionId, attributeId },
    include: { attribute: true },
  });

  res.status(201).json(link);
});

// remove an attribute from a position
router.delete('/:id/attributes/:attributeId', requireAuth, requireRole('recruiter', 'admin'), async (req, res) => {
  await prisma.positionAttribute.deleteMany({
    where: {
      positionId: Number(req.params.id),
      attributeId: Number(req.params.attributeId),
    },
  });
  res.status(204).send();
});

export default router;