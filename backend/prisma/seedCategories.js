// Script seed Categories ban đầu cho Campus Karma Exchange
// Chạy: node prisma/seedCategories.js

import prisma from '../src/utils/prisma.js';

const categories = [
  { name: 'Giáo trình & Sách', icon: '📚' },
  { name: 'Đồ điện tử', icon: '💻' },
  { name: 'Đồ gia dụng KTX', icon: '🏠' },
  { name: 'Dụng cụ thể thao', icon: '⚽' },
  { name: 'Dụng cụ học tập', icon: '✏️' },
  { name: 'Quần áo & Phụ kiện', icon: '👕' },
  { name: 'Nhạc cụ', icon: '🎸' },
  { name: 'Khác', icon: '📦' },
];

async function seed() {
  console.log('🌱 Seeding categories...');
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: { icon: cat.icon },
      create: { ...cat, updated_at: new Date() },
    });
    console.log(`  ✅ ${cat.icon} ${cat.name}`);
  }
  console.log('✅ Done!');
  await prisma.$disconnect();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
