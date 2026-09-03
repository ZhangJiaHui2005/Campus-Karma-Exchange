import prisma from '../src/utils/prisma.js';

async function seedTestData() {
  // Lấy danh sách user hiện có
  const users = await prisma.user.findMany({
    take: 3,
    include: { level: true },
    orderBy: { created_at: 'asc' }
  });

  if (users.length === 0) {
    console.log('❌ Chưa có user nào trong DB. Hãy đăng nhập Google trước!');
    await prisma.$disconnect();
    return;
  }

  console.log('👥 Users tìm thấy:');
  users.forEach(u => console.log(`  - #${u.user_id} ${u.full_name} | ${u.karma_balance} Karma | Level: ${u.level?.level_name}`));

  const owner = users[0];
  console.log(`\n📦 Tạo item mẫu cho user: ${owner.full_name}...`);

  // Lấy category_id đầu tiên
  const cat = await prisma.category.findFirst({ orderBy: { category_id: 'asc' } });

  const items = [
    {
      owner_id: owner.user_id,
      category_id: cat.category_id,
      title: 'Máy tính Casio FX-570 VN Plus',
      description: 'Còn mới 95%, dùng tốt. Tặng kèm case bảo vệ.',
      karma_value: 30,
      type: 'LEND',
      status: 'AVAILABLE',
      location: 'KTX Khu A - Phòng 305',
      image_url: 'https://images.unsplash.com/photo-1564466809058-bf4114d55352?w=400',
    },
    {
      owner_id: owner.user_id,
      category_id: cat.category_id,
      title: 'Giáo trình Giải Tích 1 (Nguyễn Đình Trí)',
      description: 'Bản in 2023, có highlight chương 1-3. Tặng luôn không lấy Karma.',
      karma_value: 0,
      type: 'GIVE',
      status: 'AVAILABLE',
      location: 'Thư viện trường - Tầng 2',
      image_url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400',
    },
  ];

  for (const itemData of items) {
    const item = await prisma.item.create({ data: itemData });
    console.log(`  ✅ Created item #${item.item_id}: ${item.title}`);
  }

  console.log('\n✅ Seed xong! Giờ có thể test mượn đồ.');
  await prisma.$disconnect();
}

seedTestData().catch(e => {
  console.error(e);
  process.exit(1);
});
