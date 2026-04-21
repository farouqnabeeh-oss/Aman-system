import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { addDays, subDays } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Cleaning cloud database for final delivery...');

  // High-level cleaning to avoid FK issues
  await prisma.auditLog.deleteMany({});
  await prisma.attendanceRecord.deleteMany({});
  await prisma.payrollRecord.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.budgetAllocation.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.client.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.department.deleteMany({});

  console.log('🌱 Deploying fully linked cloud production data...');

  const managerPass = await bcrypt.hash('aman@2026', 12);
  const employeePass = await bcrypt.hash('Password123!', 12);

  // 1. Manager
  const manager = await prisma.user.create({
    data: {
      email: 'aman10@gmail.com',
      passwordHash: managerPass,
      role: 'MANAGER',
      status: 'ACTIVE',
      firstName: 'Aman',
      lastName: 'Manager',
      department: 'OPERATIONS',
      position: 'General Manager',
      emailVerified: true,
      phone: '+966-500-000-000'
    },
  });

  // 2. Client
  const client = await prisma.client.create({
    data: {
      name: 'Global Tech Solutions',
      email: 'contact@globaltech.com',
      createdById: manager.id
    }
  });

  // 3. Project
  const project = await prisma.project.create({
    data: {
      name: 'Vision 2026 Dashboard',
      description: 'Strategic dashboard for corporate oversight and KPI tracking.',
      status: 'ACTIVE',
      budget: 250000,
      progress: 35,
      startDate: subDays(new Date(), 30),
      endDate: addDays(new Date(), 90),
      department: 'OPERATIONS',
      managerId: manager.id,
      createdById: manager.id,
    }
  });

  // 4. Finance (Transactions)
  const now = new Date();
  await prisma.transaction.create({
    data: {
      amount: 150000,
      type: 'INCOME',
      category: 'SERVICES',
      status: 'COMPLETED',
      description: 'Annual Contract',
      transactionDate: subDays(now, 5),
      createdById: manager.id
    }
  });

  // 5. Budget Allocations
  await prisma.budgetAllocation.create({
    data: {
      department: 'OPERATIONS',
      period: 'MONTHLY',
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      allocated: 80000,
      spent: 75000,
      createdById: manager.id
    }
  });

  console.log('✅ AMAN System: Cloud Deployment & Seeding Complete.');
  console.log('📋 Login: aman10@gmail.com / aman@2026');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
