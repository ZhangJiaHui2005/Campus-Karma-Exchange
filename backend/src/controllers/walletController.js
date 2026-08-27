import prisma from '../utils/prisma.js';

export const getPaymentHistory = async (req, res) => {
  try {
    const payments = await prisma.payments.findMany({
      where: { user_id: req.user.user_id, purpose: 'KARMA_TOPUP' },
      orderBy: { created_at: 'desc' },
      select: {
        payment_id: true,
        amount_vnd: true,
        karma_received: true,
        payment_gateway: true,
        transaction_ref: true,
        status: true,
        created_at: true,
        paid_at: true,
      },
    });

    return res.json({ success: true, payments });
  } catch (error) {
    console.error('Payment History Error:', error);
    return res.status(500).json({ success: false, message: 'Không thể tải lịch sử nạp tiền.' });
  }
};