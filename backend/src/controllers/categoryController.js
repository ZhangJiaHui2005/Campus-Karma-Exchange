import prisma from '../utils/prisma.js';

export const getCategories = async (_req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { items: true } } },
    });

    return res.json({ success: true, categories });
  } catch (error) {
    console.error('Get categories error:', error);
    return res.status(500).json({ success: false, message: 'Khong the tai danh muc' });
  }
};
