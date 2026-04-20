import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { addDays, subDays } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Cleaning database...');
  // Delete in reverse order of dependencies
  await prisma.auditLog.deleteMany({});
  await prisma.attendanceRecord.deleteMany({});
  await prisma.payrollRecord.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.department.deleteMany({});

  console.log('🌱 Seeding production system...');

  const systemHash = await bcrypt.hash('Password123!', 12);
  const managerHash = await bcrypt.hash('aman@2026', 12);

  // 1. Departments
  const depts = [
    'ENGINEERING', 'FINANCE', 'HR', 'MARKETING', 
    'OPERATIONS', 'SALES', 'PRODUCT', 'LEGAL'
  ];
  
  for (const name of depts) {
    await prisma.department.create({
      data: { name, budget: 1000000 }
    });
  }

  // 2. Core Accounts
  const superAdmin = await prisma.user.create({
    data: {
      email: 'superadmin@ems.dev',
      passwordHash: systemHash,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      firstName: 'System',
      lastName: 'Administrator',
      department: 'OPERATIONS',
      position: 'IT Director',
      emailVerified: true
    },
  });

  const mainManager = await prisma.user.create({
    data: {
      email: 'aman10@gmail.com',
      passwordHash: managerHash,
      role: 'MANAGER',
      status: 'ACTIVE',
      firstName: 'Aman',
      lastName: 'Management',
      department: 'OPERATIONS',
      position: 'General Manager',
      emailVerified: true,
      phone: '+966-500-000-000'
    },
  });

  // 3. Initial Project
  const project = await prisma.project.create({
    data: {
      name: 'Aman Core System',
      description: 'The central management hub for Aman Corporate Operations.',
      status: 'ACTIVE',
      budget: 500000,
      progress: 0,
      startDate: new Date(),
      endDate: addDays(new Date(), 365),
      department: 'OPERATIONS',
      managerId: mainManager.id,
      createdById: superAdmin.id,
    }
  });

  console.log('✅ Production seed complete.');
  console.log('\n📋 Access Credentials:');
  console.log('   Manager: aman10@gmail.com / aman@2026');
  console.log('   SuperAdmin: superadmin@ems.dev / Password123!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
