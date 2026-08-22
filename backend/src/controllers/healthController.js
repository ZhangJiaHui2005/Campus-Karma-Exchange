import prisma from '../utils/prisma.js';

export const checkDbConnection = async (req, res) => {
  try {
    await prisma.$connect();
    res.status(200).json({
      status: 'OK',
      message: 'Database connected successfully',
      database: {
        provider: 'postgresql',
        connected: true,
      },
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Database connection failed',
      error: error.message,
    });
  }
};
