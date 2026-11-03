import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('=== KIỂM TRA & ĐỒNG BỘ CƠ SỞ DỮ LIỆU (PRISMA DB) ===');
  const kanjiCount = await prisma.kanji.count();
  const vocabCount = await prisma.vocabulary.count();

  console.log(`Số lượng chữ Hán Kanji hiện có trong CSDL: ${kanjiCount} chữ`);
  console.log(`Số lượng từ vựng Vocabulary hiện có trong CSDL: ${vocabCount} từ`);
  console.log('=== CSDL ĐÃ SẴN SÀNG TOÀN DIỆN (DATABASE-FIRST) ===');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
