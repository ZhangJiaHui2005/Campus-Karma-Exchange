import prisma from '../utils/prisma.js';

/**
 * Lấy danh sách tất cả các Level được sắp xếp theo min_karma tăng dần
 */
export const getAllLevels = async (db = prisma) => {
  return db.level.findMany({
    orderBy: { min_karma: 'asc' },
  });
};

/**
 * Tìm Level phù hợp với số điểm Karma hiện có
 * @param {number} karma Số điểm Karma
 * @param {Array} levels Danh sách levels (tuỳ chọn)
 * @param {object} db Prisma instance
 */
export const findLevelByKarma = async (karma, levels = null, db = prisma) => {
  const allLevels = levels || (await getAllLevels(db));
  if (!allLevels || allLevels.length === 0) {
    throw new Error('Chưa có cấu hình Level trong hệ thống.');
  }

  const safeKarma = Math.max(0, Number(karma) || 0);

  // Tìm level thỏa mãn: min_karma <= safeKarma <= max_karma
  const matched = allLevels.find(
    (lvl) => safeKarma >= lvl.min_karma && safeKarma <= lvl.max_karma
  );

  if (matched) return matched;

  // Nếu điểm lớn hơn max_karma của tất cả, lấy level cao nhất
  if (safeKarma > allLevels[allLevels.length - 1].max_karma) {
    return allLevels[allLevels.length - 1];
  }

  // Mặc định lấy level đầu tiên (Tân thủ)
  return allLevels[0];
};

/**
 * Tính toán tiến trình thăng hạng (Progress)
 */
export const calculateProgress = (karma, currentLevel, allLevels) => {
  const safeKarma = Math.max(0, Number(karma) || 0);
  const currentIndex = allLevels.findIndex(
    (l) => l.level_id === currentLevel.level_id
  );
  const nextLevel =
    currentIndex >= 0 && currentIndex < allLevels.length - 1
      ? allLevels[currentIndex + 1]
      : null;

  if (!nextLevel) {
    return {
      currentLevel,
      nextLevel: null,
      progressPct: 100,
      karmaNeeded: 0,
      isMaxLevel: true,
    };
  }

  const range = nextLevel.min_karma - currentLevel.min_karma;
  const currentInRange = Math.max(0, safeKarma - currentLevel.min_karma);
  const progressPct = Math.min(
    100,
    Math.max(0, Math.round((currentInRange / range) * 100))
  );
  const karmaNeeded = Math.max(0, nextLevel.min_karma - safeKarma);

  return {
    currentLevel,
    nextLevel,
    progressPct,
    karmaNeeded,
    isMaxLevel: false,
  };
};

/**
 * Điều chỉnh Karma và tự động cập nhật Level cho User
 * @param {number} userId ID người dùng
 * @param {object} options { amount, action, targetLevelId, reason }
 * @param {object} db Prisma instance
 */
export const adjustUserKarmaAndLevel = async (
  userId,
  { amount, action, targetLevelId, reason = 'Điều chỉnh điểm hệ thống' } = {},
  db = prisma
) => {
  const user = await db.user.findUnique({
    where: { user_id: Number(userId) },
    include: { level: true },
  });

  if (!user) {
    throw new Error(`Không tìm thấy người dùng với ID: ${userId}`);
  }

  const allLevels = await getAllLevels(db);
  const currentIndex = allLevels.findIndex(
    (l) => l.level_id === user.level_id
  );

  let newKarma = user.karma_balance;

  if (targetLevelId !== undefined && targetLevelId !== null) {
    const target = allLevels.find((l) => l.level_id === Number(targetLevelId));
    if (!target) {
      throw new Error(`Cấp độ đích ID ${targetLevelId} không tồn tại.`);
    }
    // Gán điểm karma về mốc tối thiểu của level đó (hoặc giữ nguyên nếu đã nằm trong khoảng)
    if (newKarma < target.min_karma || newKarma > target.max_karma) {
      newKarma = target.min_karma;
    }
  } else if (action === 'level_up' || action === 'up') {
    if (currentIndex < allLevels.length - 1) {
      const nextLevel = allLevels[currentIndex + 1];
      newKarma = Math.max(user.karma_balance, nextLevel.min_karma);
    }
  } else if (action === 'level_down' || action === 'down') {
    if (currentIndex > 0) {
      const prevLevel = allLevels[currentIndex - 1];
      newKarma = Math.min(user.karma_balance, prevLevel.max_karma);
    }
  } else if (amount !== undefined && amount !== null && !Number.isNaN(Number(amount))) {
    newKarma = Math.max(0, user.karma_balance + Number(amount));
  } else {
    throw new Error(
      'Vui lòng cung cấp `amount` (số nguyên cộng/trừ), `action` ("level_up"|"level_down") hoặc `targetLevelId`.'
    );
  }

  // Tự động tính toán Level mới theo Karma
  const newLevel = await findLevelByKarma(newKarma, allLevels, db);

  const previousLevel = user.level;
  const isLevelUp = newLevel.level_id > user.level_id;
  const isLevelDown = newLevel.level_id < user.level_id;
  const changeType = isLevelUp
    ? 'LEVEL_UP'
    : isLevelDown
    ? 'LEVEL_DOWN'
    : 'NO_CHANGE';

  // Cập nhật User trong DB
  const updatedUser = await db.user.update({
    where: { user_id: user.user_id },
    data: {
      karma_balance: newKarma,
      level_id: newLevel.level_id,
    },
    include: { level: true },
  });

  const progress = calculateProgress(newKarma, newLevel, allLevels);

  return {
    user: updatedUser,
    previous_karma: user.karma_balance,
    current_karma: newKarma,
    karma_difference: newKarma - user.karma_balance,
    previous_level: previousLevel,
    current_level: newLevel,
    level_changed: newLevel.level_id !== user.level_id,
    change_type: changeType,
    progress,
    reason,
  };
};

/**
 * Đồng bộ lại level của người dùng nếu điểm Karma không khớp với Level hiện tại
 */
export const syncUserLevel = async (userId, db = prisma) => {
  const user = await db.user.findUnique({
    where: { user_id: Number(userId) },
    include: { level: true },
  });

  if (!user) return null;

  const allLevels = await getAllLevels(db);
  const correctLevel = await findLevelByKarma(user.karma_balance, allLevels, db);

  if (correctLevel.level_id !== user.level_id) {
    const updated = await db.user.update({
      where: { user_id: user.user_id },
      data: { level_id: correctLevel.level_id },
      include: { level: true },
    });
    return updated;
  }

  return user;
};
