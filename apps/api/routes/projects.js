import express from 'express';
import { PrismaClient } from '../generated/prisma/index.js';
import { requireAuth } from '../middleware/auth.js';

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

// create a project
router.post('/', requireAuth, async (req, res) => {
  const { name, startDate, endDate, description, tags } = req.body;

  const project = await prisma.project.create({
    data: {
      userId: req.user.userId,
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

export default router;