import express from 'express';
import { PrismaClient } from '../generated/prisma/index.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const prisma = new PrismaClient();
const router = express.Router();

// like a CV
router.post('/:cvId', requireAuth, requireRole('recruiter', 'admin'), async (req, res) => {
  const cvId = Number(req.params.cvId);

  const like = await prisma.cVLike.create({
    data: { cvId, recruiterId: req.user.userId },
  });

  res.status(201).json(like);
});

// unlike a CV
router.delete('/:cvId', requireAuth, requireRole('recruiter', 'admin'), async (req, res) => {
  await prisma.cVLike.deleteMany({
    where: { cvId: Number(req.params.cvId), recruiterId: req.user.userId },
  });
  res.status(204).send();
});

export default router;