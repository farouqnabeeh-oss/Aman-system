import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const tableInfo = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'daily_reports'
    `;
    console.log('DailyReport columns:', tableInfo);
  } catch (e) {
    console.error('Failed to get table info:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
