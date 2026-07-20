import express from 'express';
import { PrismaClient } from '../generated/prisma/index.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const prisma = new PrismaClient();
const router = express.Router();

// get all posts for a position, oldest first (chronological, append-only)
router.get('/:positionId', requireAuth, async (req, res) => {
  const posts = await prisma.discussionPost.findMany({
    where: { positionId: Number(req.params.positionId) },
    include: { author: true },
    orderBy: { createdAt: 'asc' },
  });
  res.json(posts);
});

// add a new post
router.post('/:positionId', requireAuth, async (req, res) => {
  const { content } = req.body;

  const post = await prisma.discussionPost.create({
    data: {
      positionId: Number(req.params.positionId),
      authorId: req.user.userId,
      content,
    },
    include: { author: true },
  });

  res.status(201).json(post);
});

export default router;