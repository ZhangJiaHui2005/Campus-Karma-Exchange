import prisma from '../utils/prisma.js';

export const insertInsuranceLog = async (
  trans_id,
  karma_amount,
  rate_pct,
  db = prisma,
) => {
  if (!trans_id || !Number.isInteger(karma_amount) || karma_amount <= 0) {
    throw new Error('trans_id and a positive integer karma_amount are required.');
  }

  const rate = Number(rate_pct);
  if (!Number.isFinite(rate) || rate <= 0) {
    throw new Error('rate_pct must be a positive number.');
  }

  return db.insurance_Fund_Logs.create({
    data: {
      trans_id,
      amount_karma: karma_amount,
      rate_pct: rate,
    },
  });
};

export default insertInsuranceLog;