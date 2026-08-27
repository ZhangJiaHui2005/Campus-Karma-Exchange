import cron from 'node-cron';
import prisma from '../utils/prisma.js';
import membershipEvents from '../events/membershipEvents.js';

const DEFAULT_CRON = '0 * * * *';

export const expireMemberships = async (db = prisma, now = new Date()) => {
  const expiredMemberships = await db.$transaction(async (transaction) => {
    const memberships = await transaction.memberships.findMany({
      where: {
        end_at: { lt: now },
        status: 'ACTIVE',
      },
    });
    const expired = [];

    for (const membership of memberships) {
      const result = await transaction.memberships.updateMany({
        where: {
          membership_id: membership.membership_id,
          status: 'ACTIVE',
        },
        data: { status: 'EXPIRED' },
      });
      if (result.count === 1) expired.push(membership);
    }

    return expired;
  });

  for (const membership of expiredMemberships) {
    membershipEvents.emit('membership.expired', membership);
  }

  return expiredMemberships;
};

export const startMembershipExpiryJob = () => {
  const cronExpression = process.env.MEMBERSHIP_EXPIRY_CRON || DEFAULT_CRON;
  const task = cron.schedule(cronExpression, async () => {
    try {
      const expiredMemberships = await expireMemberships();
      if (expiredMemberships.length > 0) {
        console.log(`Expired ${expiredMemberships.length} membership(s).`);
      }
    } catch (error) {
      console.error('Membership expiry job failed:', error);
    }
  });

  void expireMemberships().catch((error) => {
    console.error('Initial membership expiry check failed:', error);
  });

  return task;
};