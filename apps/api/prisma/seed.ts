import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { addDays, subDays, startOfMonth } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Clearing all previous data...');
  const tableNames = [
    'AuditLog', 'AttendanceRecord', 'PayrollRecord', 'Task', 'Project', 
    'User', 'Department', 'Notification', 'BudgetAllocation', 'Transaction', 'Invoice'
  ];
  for (const table of tableNames) {
    try {
      // @ts-ignore
      await prisma[table.toLowerCase()].deleteMany({});
    } catch(e) {}
  }

  console.log('🌱 Initializing AMAN System (Production Ready)...');

  const managerPass = await bcrypt.hash('aman@2026', 12);
  const employeePass = await bcrypt.hash('Password123!', 12);

  // 1. Departments
  const engineering = await prisma.department.create({ data: { name: 'ENGINEERING', budget: 1000000 } });
  const operations = await prisma.department.create({ data: { name: 'OPERATIONS', budget: 800000 } });
  const hr = await prisma.department.create({ data: { name: 'HR', budget: 300000 } });

  // 2. Main Manager (aman10@gmail.com)
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

  // 3. Employees
  const dev1 = await prisma.user.create({
    data: {
      email: 'dev1@aman.dev',
      passwordHash: employeePass,
      role: 'EMPLOYEE',
      status: 'ACTIVE',
      firstName: 'Faisal',
      lastName: 'Ahmed',
      department: 'ENGINEERING',
      position: 'Senior Developer',
      emailVerified: true
    }
  });

  const hr1 = await prisma.user.create({
    data: {
      email: 'hr1@aman.dev',
      passwordHash: employeePass,
      role: 'EMPLOYEE',
      status: 'ACTIVE',
      firstName: 'Laila',
      lastName: 'Khalid',
      department: 'HR',
      position: 'HR Specialist',
      emailVerified: true
    }
  });

  // 4. Integrated Projects
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

  // 5. Linked Tasks
  await prisma.task.createMany({
    data: [
      {
        title: 'Backend API Hardening',
        description: 'Verify all JWT logic and relationship integrity.',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        projectId: project.id,
        assigneeId: dev1.id,
        reporterId: manager.id,
        dueDate: addDays(new Date(), 3),
      },
      {
        title: 'Employee Onboarding flow',
        description: 'Design the new digital onboarding protocol.',
        status: 'TODO',
        priority: 'MEDIUM',
        projectId: project.id,
        assigneeId: hr1.id,
        reporterId: manager.id,
        dueDate: addDays(new Date(), 7),
      }
    ]
  });

  // 6. Financial Data (Transactions)
  const now = new Date();
  await prisma.transaction.createMany({
    data: [
      {
        amount: 50000,
        type: 'INCOME',
        category: 'SERVICES',
        status: 'COMPLETED',
        description: 'Quarterly Service Fee',
        transactionDate: subDays(now, 5),
        createdById: manager.id
      },
      {
        amount: 15000,
        type: 'EXPENSE',
        category: 'RENT',
        status: 'COMPLETED',
        description: 'Headquarters Rent',
        transactionDate: subDays(now, 2),
        createdById: manager.id
      }
    ]
  });

  // 7. Budget Allocations (for Dashboard Radar)
  await prisma.budgetAllocation.createMany({
    data: [
      { department: 'ENGINEERING', period: 'MONTHLY', year: now.getFullYear(), month: now.getMonth() + 1, allocated: 100000, spent: 45000, createdById: manager.id },
      { department: 'OPERATIONS', period: 'MONTHLY', year: now.getFullYear(), month: now.getMonth() + 1, allocated: 80000, spent: 62000, createdById: manager.id },
      { department: 'HR', period: 'MONTHLY', year: now.getFullYear(), month: now.getMonth() + 1, allocated: 30000, spent: 12000, createdById: manager.id }
    ]
  });

  // 8. Payroll & Attendance
  await prisma.payrollRecord.createMany({
    data: [
      { userId: manager.id, month: now.getMonth() + 1, year: 2026, baseSalary: 12000, allowances: 2000, netSalary: 14000, isPaid: true, paidAt: new Date() },
      { userId: dev1.id, month: now.getMonth() + 1, year: 2026, baseSalary: 8000, allowances: 1000, netSalary: 9000, isPaid: false }
    ]
  });

  await prisma.attendanceRecord.createMany({
    data: [
      { userId: dev1.id, date: subDays(now, 1), status: 'PRESENT', checkIn: subDays(now, 1) },
      { userId: hr1.id, date: subDays(now, 1), status: 'LATE', checkIn: subDays(now, 1) }
    ]
  });

  console.log('✅ AMAN Production Seed Complete. Dashboard is now ALIVE.');
  console.log('\n📋 Access Details:');
  console.log('   Manager: aman10@gmail.com / aman@2026');
  console.log('   Employee: dev1@aman.dev / Password123!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
