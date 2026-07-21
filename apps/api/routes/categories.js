import express from 'express';
import { PrismaClient } from '../generated/prisma/index.js';
import { requireAuth } from '../middleware/auth.js';

const prisma = new PrismaClient();
const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  const categories = await prisma.attributeCategory.findMany({
    orderBy: { name: 'asc' },
  });
  res.json(categories);
});

export default router;