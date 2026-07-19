import express from 'express';
import { PrismaClient } from '../generated/prisma/index.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const prisma = new PrismaClient();
const router = express.Router();

// anyone logged in can browse the library
router.get('/', requireAuth, async (req, res) => {
  const { search, category } = req.query;

  const attributes = await prisma.attribute.findMany({
    where: {
      name: search ? { startsWith: search, mode: 'insensitive' } : undefined,
      categoryId: category ? Number(category) : undefined,
    },
    include: { category: true },
    orderBy: { name: 'asc' },
  });

  res.json(attributes);
});

// only recruiters/admins can create attributes
router.post('/', requireAuth, requireRole('recruiter', 'admin'), async (req, res) => {
  const { name, description, type, categoryId } = req.body;

  const attribute = await prisma.attribute.create({
    data: { name, description, type, categoryId },
  });

  res.status(201).json(attribute);
});

// edit, with optimistic locking
router.put('/:id', requireAuth, requireRole('recruiter', 'admin'), async (req, res) => {
  const { name, description, type, categoryId, version } = req.body;
  const id = Number(req.params.id);

  const result = await prisma.attribute.updateMany({
    where: { id, version },
    data: { name, description, type, categoryId, version: { increment: 1 } },
  });

  if (result.count === 0) {
    return res.status(409).json({ error: 'This attribute was changed by someone else. Please reload.' });
  }

  res.json({ success: true });
});

// delete
router.delete('/:id', requireAuth, requireRole('recruiter', 'admin'), async (req, res) => {
  await prisma.attribute.delete({ where: { id: Number(req.params.id) } });
  res.status(204).send();
});

export default router;