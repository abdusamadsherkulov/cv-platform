import express from 'express';
import { PrismaClient } from '../generated/prisma/index.js';
import { requireAuth } from '../middleware/auth.js';

const prisma = new PrismaClient();
const router = express.Router();

// get all of the current user's filled-in attribute values
router.get('/', requireAuth, async (req, res) => {
  const values = await prisma.attributeValue.findMany({
    where: { userId: req.user.userId },
    include: { attribute: { include: { category: true } } },
  });
  res.json(values);
});

// add or update a value for an attribute (used when picking a new attribute to fill in)
router.put('/:attributeId', requireAuth, async (req, res) => {
  const attributeId = Number(req.params.attributeId);
  const { value, version } = req.body;

  const existing = await prisma.attributeValue.findUnique({
    where: { userId_attributeId: { userId: req.user.userId, attributeId } },
  });

  if (!existing) {
    const created = await prisma.attributeValue.create({
      data: { userId: req.user.userId, attributeId, value },
    });
    return res.json(created);
  }

  const result = await prisma.attributeValue.updateMany({
    where: { userId: req.user.userId, attributeId, version },
    data: { value, version: { increment: 1 } },
  });

  if (result.count === 0) {
    return res.status(409).json({ error: 'This value was changed elsewhere. Please reload.' });
  }

  res.json({ success: true });
});

// remove an attribute from the profile entirely
router.delete('/:attributeId', requireAuth, async (req, res) => {
  await prisma.attributeValue.deleteMany({
    where: { userId: req.user.userId, attributeId: Number(req.params.attributeId) },
  });
  res.status(204).send();
});

export default router;