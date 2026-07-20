import express from 'express';
import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();
const router = express.Router();

// public - no auth required, per spec (visible to non-logged-in users too)
router.get('/', async (req, res) => {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [
    latestPositions,
    totalPositions,
    totalCandidates,
    totalRecruiters,
    totalCVs,
    recentCVs,
    positionsWithCvCounts,
  ] = await Promise.all([
    prisma.position.findMany({ orderBy: { updatedAt: 'desc' }, take: 5 }),
    prisma.position.count(),
    prisma.user.count({ where: { role: 'candidate' } }),
    prisma.user.count({ where: { role: 'recruiter' } }),
    prisma.cV.count(),
    prisma.cV.count({ where: { createdAt: { gte: oneDayAgo } } }),
    prisma.position.findMany({
      include: { _count: { select: { cvs: true } } },
      orderBy: { cvs: { _count: 'desc' } },
      take: 5,
    }),
  ]);

  res.json({
    latestPositions,
    stats: {
      totalPositions,
      totalCandidates,
      totalRecruiters,
      totalCVs,
      recentCVs,
    },
    popularPositions: positionsWithCvCounts,
  });
});

export default router;