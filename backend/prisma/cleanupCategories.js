import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.ts";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const canonicalCategories = [
  { name: "Giáo trình & Sách", icon: "book-open" },
  { name: "Đồ điện tử", icon: "laptop" },
  { name: "Đồ gia dụng KTX", icon: "house" },
  { name: "Dụng cụ thể thao", icon: "dumbbell" },
  { name: "Dụng cụ học tập", icon: "pencil" },
  { name: "Quần áo & Phụ kiện", icon: "shirt" },
  { name: "Nhạc cụ", icon: "music" },
  { name: "Khác", icon: "circle-ellipsis" },
];

const legacyMappings = [
  ["Sach va tai lieu", "Giáo trình & Sách"],
  ["Do dien tu", "Đồ điện tử"],
  ["Quan ao", "Quần áo & Phụ kiện"],
  ["Do gia dung", "Đồ gia dụng KTX"],
  ["The thao", "Dụng cụ thể thao"],
  ["Khac", "Khác"],
];

async function main() {
  const movedItems = await prisma.$transaction(
    async (tx) => {
      for (const category of canonicalCategories) {
        await tx.category.upsert({
          where: { name: category.name },
          update: { icon: category.icon },
          create: category,
        });
      }

      let movedCount = 0;

      for (const [legacyName, canonicalName] of legacyMappings) {
        const legacy = await tx.category.findUnique({ where: { name: legacyName } });
        if (!legacy) continue;

        const canonical = await tx.category.findUniqueOrThrow({
          where: { name: canonicalName },
        });

        const result = await tx.item.updateMany({
          where: { category_id: legacy.category_id },
          data: { category_id: canonical.category_id },
        });

        movedCount += result.count;
        await tx.category.delete({ where: { category_id: legacy.category_id } });
      }

      return movedCount;
    },
    { timeout: 20000 },
  );

  const categories = await prisma.category.findMany({
    select: {
      category_id: true,
      name: true,
      icon: true,
      _count: { select: { items: true } },
    },
    orderBy: { name: "asc" },
  });

  console.log(`Đã chuyển ${movedItems} vật phẩm sang danh mục chuẩn.`);
  console.table(
    categories.map((category) => ({
      id: category.category_id,
      name: category.name,
      icon: category.icon,
      items: category._count.items,
    })),
  );
}

main()
  .catch((error) => {
    console.error("Dọn dữ liệu danh mục thất bại:", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
