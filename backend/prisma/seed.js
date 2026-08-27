import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.ts";
import bcrypt from "bcrypt";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  // await prisma.level.createMany({
  //   skipDuplicates: true,
  //   data: [
  //     { level_id: 1, level_name: 'Tân thủ', min_karma: 0, max_karma: 200, borrow_limit: 2, deposit_discount_pct: 0 },
  //     { level_id: 2, level_name: 'Tích cực', min_karma: 201, max_karma: 1000, borrow_limit: 5, deposit_discount_pct: 20 },
  //     { level_id: 3, level_name: 'Đại sứ Xanh', min_karma: 1001, max_karma: 999999, borrow_limit: 10, deposit_discount_pct: 50 },
  //   ],
  // });
  // await prisma.category.createMany({
  //   skipDuplicates: true,
  //   data: [
  //     { name: 'Sach va tai lieu', icon: 'book-open' },
  //     { name: 'Do dien tu', icon: 'laptop' },
  //     { name: 'Quan ao', icon: 'shirt' },
  //     { name: 'Do gia dung', icon: 'package' },
  //     { name: 'The thao', icon: 'dumbbell' },
  //     { name: 'Khac', icon: 'circle-ellipsis' },
  //   ],
  // });

  await prisma.admin.createMany({
    skipDuplicates: true,
    data: [
      { email: 'huunhan882005@gmail.com', password_hash: await bcrypt.hash("12345678", await bcrypt.genSalt(10)), full_name: 'Tran Huu Nhan' },
    ]
  });
  console.log('Seed dữ liệu ADMIN thành công!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
