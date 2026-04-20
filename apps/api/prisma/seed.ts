import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { addDays, subDays, startOfMonth } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Cleaning database for final delivery...');
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

  console.log('🌱 Deploying fully linked AMAN production data...');

  const managerPass = await bcrypt.hash('aman@2026', 12);
  const employeePass = await bcrypt.hash('Password123!', 12);

  // 1. Departments
  await prisma.department.createMany({
    data: [
      { name: 'ENGINEERING', budget: 1000000 },
      { name: 'OPERATIONS', budget: 800000 },
      { name: 'HR', budget: 300000 },
      { name: 'FINANCE', budget: 500000 },
      { name: 'MARKETING', budget: 400000 }
    ]
  });

  // 2. Manager
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

  // 4. Projects
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

  // 5. Tasks
  await prisma.task.createMany({
    data: [
      {
        title: 'Backend API Hardening',
        description: 'Verify relationship integrity in the ORM layer.',
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

  // 6. Invoices (for Overdue KPI)
  await prisma.invoice.createMany({
    data: [
      {
        invoiceNumber: 'INV-2026-001',
        status: 'OVERDUE',
        issueDate: subDays(new Date(), 45),
        dueDate: subDays(new Date(), 15),
        subtotal: 1500,
        tax: 225,
        total: 1725,
        clientId: 'temp-client-id',
        projectId: project.id,
        createdById: manager.id
      }
    ]
  });

  // 7. Finance Data
  const now = new Date();
  await prisma.transaction.createMany({
    data: [
      { amount: 150000, type: 'INCOME', category: 'SERVICES', status: 'COMPLETED', description: 'Annual Contract', transactionDate: subDays(now, 5), createdById: manager.id },
      { amount: 25000, type: 'EXPENSE', category: 'OPERATIONS', status: 'COMPLETED', description: 'Equipment Purchase', transactionDate: subDays(now, 2), createdById: manager.id }
    ]
  });

  // 8. Budget Allocations (Radar Chart)
  await prisma.budgetAllocation.createMany({
    data: [
      { department: 'ENGINEERING', period: 'MONTHLY', year: now.getFullYear(), month: now.getMonth() + 1, allocated: 100000, spent: 45000, createdById: manager.id },
      { department: 'OPERATIONS', period: 'MONTHLY', year: now.getFullYear(), month: now.getMonth() + 1, allocated: 80000, spent: 75000, createdById: manager.id },
      { department: 'HR', period: 'MONTHLY', year: now.getFullYear(), month: now.getMonth() + 1, allocated: 30000, spent: 12000, createdById: manager.id },
      { department: 'FINANCE', period: 'MONTHLY', year: now.getFullYear(), month: now.getMonth() + 1, allocated: 50000, spent: 10000, createdById: manager.id }
    ]
  });

  // 9. Extra Activity Logs (to make feed look good)
  await prisma.auditLog.createMany({
    data: [
       { userId: manager.id, action: 'CREATE', entity: 'PROJECT', entityId: project.id, details: 'Created Vision 2026 Dashboard' },
       { userId: dev1.id, action: 'UPDATE', entity: 'TASK', details: 'Started work on API Hardening' }
    ]
  });

  console.log('✅ AMAN System: Full Relational Sync Complete.');
  console.log('📋 Access: aman10@gmail.com / aman@2026');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
