import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const user = await prisma.user.findFirst();
    if (!user) {
      console.log('No user found');
      return;
    }

    console.log('Testing submission for user:', user.id);

    const data = {
      done: 'Test done',
      plan: 'Test plan',
      blocks: 'Test blocks'
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existing = await prisma.dailyReport.findFirst({
      where: {
        userId: user.id,
        date: { gte: today, lt: tomorrow }
      }
    });

    if (existing) {
      console.log('Updating existing report:', existing.id);
      await prisma.dailyReport.update({
        where: { id: existing.id },
        data: { done: data.done, plan: data.plan, blocks: data.blocks || '' }
      });
    } else {
      console.log('Creating new report');
      await prisma.dailyReport.create({
        data: {
          userId: user.id,
          done: data.done,
          plan: data.plan,
          blocks: data.blocks || ''
        }
      });
    }
    console.log('Success!');
  } catch (e) {
    console.error('Submission failed:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
