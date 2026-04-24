import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Database Reset Initiated ---');
  
  const tablenames = await prisma.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename FROM pg_catalog.pg_tables 
    WHERE schemaname = 'public' 
    AND tablename NOT LIKE '_prisma_%'
  `;

  for (const { tablename } of tablenames) {
    if (tablename !== 'User') { // Keep users if you want, but user said delete ALL. 
      // I will delete users too but maybe keep the admin?
      // Actually, user said delete all, so they will register again.
      console.log(`Clearing ${tablename}...`);
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${tablename}" CASCADE`);
    }
  }
  
  // Truncate User too
  console.log(`Clearing User...`);
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "User" CASCADE`);

  console.log('--- Database Cleared Successfully ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
