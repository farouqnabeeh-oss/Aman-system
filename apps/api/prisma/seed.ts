import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { addDays, subDays } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with production-ready base data and relationships...');

  const hash = await bcrypt.hash('Password123!', 12);

  // 1. Fundamental Departments
  const depts = [
    'ENGINEERING', 'FINANCE', 'HR', 'MARKETING', 
    'OPERATIONS', 'SALES', 'PRODUCT', 'LEGAL'
  ];
  
  console.log('  - Creating departments...');
  for (const name of depts) {
    await prisma.department.upsert({
      where: { name },
      update: {},
      create: { name, budget: 500000 }
    });
  }

  // 2. Core Users
  console.log('  - Creating users...');
  
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@ems.dev' },
    update: {},
    create: {
      email: 'superadmin@ems.dev',
      passwordHash: hash,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      firstName: 'System',
      lastName: 'Administrator',
      department: 'OPERATIONS',
      position: 'IT Director',
      emailVerified: true
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: 'manager@ems.dev' },
    update: {},
    create: {
      email: 'manager@ems.dev',
      passwordHash: hash,
      role: 'MANAGER',
      status: 'ACTIVE',
      firstName: 'Omar',
      lastName: 'Hassan',
      department: 'ENGINEERING',
      position: 'Software Manager',
      emailVerified: true
    },
  });

  const employee = await prisma.user.upsert({
    where: { email: 'employee@ems.dev' },
    update: {},
    create: {
      email: 'employee@ems.dev',
      passwordHash: hash,
      role: 'EMPLOYEE',
      status: 'ACTIVE',
      firstName: 'Sarah',
      lastName: 'Ahmed',
      department: 'ENGINEERING',
      position: 'Frontend Developer',
      emailVerified: true
    },
  });

  // 3. Projects (Relationship: Manager -> Project)
  console.log('  - Creating projects...');
  const project = await prisma.project.create({
    data: {
      name: 'Eagle Eye Dashboard',
      description: 'Advanced monitoring system for corporate infrastructure',
      status: 'ACTIVE',
      budget: 120000,
      progress: 45,
      startDate: subDays(new Date(), 30),
      endDate: addDays(new Date(), 60),
      department: 'ENGINEERING',
      managerId: manager.id,
      createdById: superAdmin.id,
    }
  });

  // 4. Tasks (Relationship: Project -> Task, Assignee -> Task)
  console.log('  - Creating tasks...');
  await prisma.task.createMany({
    data: [
      {
        title: 'Design UI Components',
        description: 'Create high-fidelity glassmorphism components',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        projectId: project.id,
        assigneeId: employee.id,
        reporterId: manager.id,
        dueDate: addDays(new Date(), 5),
      },
      {
        title: 'Setup API Gateway',
        description: 'Configure NestJS gateway with rate limiting',
        status: 'TODO',
        priority: 'CRITICAL',
        projectId: project.id,
        assigneeId: manager.id,
        reporterId: superAdmin.id,
        dueDate: addDays(new Date(), 2),
      }
    ]
  });

  // 5. Payroll (Relationship: User -> Payroll)
  console.log('  - Creating payroll records...');
  const now = new Date();
  await prisma.payrollRecord.createMany({
    data: [
      {
        userId: manager.id,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        baseSalary: 8500,
        allowances: 1000,
        bonus: 500,
        netSalary: 10000,
        isPaid: true,
        paidAt: new Date()
      },
      {
        userId: employee.id,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        baseSalary: 4500,
        allowances: 500,
        bonus: 0,
        netSalary: 5000,
        isPaid: false
      }
    ]
  });

  // 6. Attendance
  console.log('  - Creating attendance records...');
  await prisma.attendanceRecord.createMany({
    data: [
      { userId: manager.id, date: subDays(new Date(), 1), status: 'PRESENT', checkIn: subDays(new Date(), 1), checkOut: subDays(new Date(), 1) },
      { userId: employee.id, date: subDays(new Date(), 1), status: 'LATE', checkIn: subDays(new Date(), 1), checkOut: subDays(new Date(), 1) }
    ]
  });

  console.log('✅ Seed complete! Full system link established.');
  console.log('\n📋 Test Access:');
  console.log('   Admin: superadmin@ems.dev / Password123!');
  console.log('   Manager: manager@ems.dev / Password123!');
  console.log('   Employee: employee@ems.dev / Password123!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
