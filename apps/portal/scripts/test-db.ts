import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Connecting to database...');
    await prisma.$connect();
    console.log('Connected successfully!');
    
    const userCount = await prisma.user.count();
    console.log(`Current user count: ${userCount}`);
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Database connection test failed:', error);
    process.exit(1);
  }
}

main();
