import { PrismaClient } from '@prisma/client';

async function check() {
    const prisma = new PrismaClient();
    console.log('Available models:', Object.keys(prisma).filter(k => !k.startsWith('_') && typeof (prisma as any)[k] === 'object'));
    process.exit(0);
}

check();
