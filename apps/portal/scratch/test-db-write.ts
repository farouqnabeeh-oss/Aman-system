import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const userCount = await prisma.user.count();
    console.log('User count:', userCount);
    
    // Try to create a test client
    const admin = await prisma.user.findFirst({ where: { role: 'SUPER_ADMIN' } });
    if (!admin) {
      console.error('No admin found to create client');
      return;
    }

    const testClient = await prisma.client.create({
      data: {
        name: 'Test Client ' + Date.now(),
        createdById: admin.id,
      }
    });
    console.log('Successfully created test client:', testClient.id);
    
    // Clean up
    await prisma.client.delete({ where: { id: testClient.id } });
    console.log('Successfully deleted test client');
  } catch (err) {
    console.error('Database test failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
