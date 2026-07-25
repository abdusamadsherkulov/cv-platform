import express from 'express';
import { PrismaClient } from '../generated/prisma/index.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const prisma = new PrismaClient();
const router = express.Router();

// candidate's own projects
router.get('/', requireAuth, async (req, res) => {
  const projects = await prisma.project.findMany({
    where: { userId: req.user.userId },
    orderBy: { startDate: 'desc' },
  });
  res.json(projects);
});

// admin/recruiter view all projects across all candidates
router.get('/all', requireAuth, async (req, res) => {
  const projects = await prisma.project.findMany({
    include: { user: true },
    orderBy: { startDate: 'desc' },
  });
  res.json(projects);
});

// view a specific candidate's projects - admin/recruiter (read) or the candidate themself
router.get('/user/:userId', requireAuth, async (req, res) => {
  const targetUserId = Number(req.params.userId);

  if (req.user.role === 'candidate' && req.user.userId !== targetUserId) {
    return res.status(403).json({ error: 'Not authorized' });
  }

  const projects = await prisma.project.findMany({
    where: { userId: targetUserId },
    orderBy: { startDate: 'desc' },
  });
  res.json(projects);
});

// create a project - candidate creates their own, or admin creates on behalf of any candidate
router.post('/', requireAuth, async (req, res) => {
  const { name, startDate, endDate, description, tags, userId } = req.body;

  const targetUserId = req.user.role === 'admin' && userId ? Number(userId) : req.user.userId;

  if (req.user.role === 'recruiter') {
    return res.status(403).json({ error: 'Recruiters cannot create projects' });
  }

  const project = await prisma.project.create({
    data: {
      userId: targetUserId,
      name,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      description,
      tags: tags || [],
    },
  });

  res.status(201).json(project);
});

// edit a project
router.put('/:id', requireAuth, async (req, res) => {
  const { name, startDate, endDate, description, tags } = req.body;

  // only touch this candidate's own project, never someone else's
  const result = await prisma.project.updateMany({
    where: { id: Number(req.params.id), userId: req.user.userId },
    data: {
      name,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      description,
      tags: tags || [],
    },
  });

  if (result.count === 0) {
    return res.status(404).json({ error: 'Project not found' });
  }

  res.json({ success: true });
});

// delete a project
router.delete('/:id', requireAuth, async (req, res) => {
  await prisma.project.deleteMany({
    where: { id: Number(req.params.id), userId: req.user.userId },
  });
  res.status(204).send();
});

// admin edits any project
router.put('/:id/admin', requireAuth, requireRole('admin'), async (req, res) => {
  const { name, startDate, endDate, description, tags } = req.body;

  const project = await prisma.project.update({
    where: { id: Number(req.params.id) },
    data: {
      name,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      description,
      tags: tags || [],
    },
  });

  res.json(project);
});

// admin deletes any project
router.delete('/:id/admin', requireAuth, requireRole('admin'), async (req, res) => {
  await prisma.project.delete({ where: { id: Number(req.params.id) } });
  res.status(204).send();
});

export default router;