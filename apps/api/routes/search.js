import express from 'express';
import { PrismaClient } from '../generated/prisma/index.js';
import { requireAuth } from '../middleware/auth.js';

const prisma = new PrismaClient();
const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  const { q } = req.query;
  if (!q || !q.trim()) return res.json({ positions: [], attributes: [] });

  const [positions, attributes] = await Promise.all([
    prisma.position.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 10,
    }),
    prisma.attribute.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 10,
    }),
  ]);

  res.json({ positions, attributes });
});

export default router;