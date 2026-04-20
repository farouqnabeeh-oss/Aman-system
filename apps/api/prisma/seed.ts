import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { addDays, subDays } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Clearing all previous data...');
  const tableNames = ['AuditLog', 'AttendanceRecord', 'PayrollRecord', 'Task', 'Project', 'User', 'Department', 'Notification', 'BudgetAllocation'];
  for (const table of tableNames) {
    try {
      // @ts-ignore
      await prisma[table.toLowerCase()].deleteMany({});
    } catch(e) {}
  }

  console.log('🌱 Initializing AMAN System with Manager & Employees only...');

  const managerPass = await bcrypt.hash('aman@2026', 12);
  const employeePass = await bcrypt.hash('Password123!', 12);

  // 1. Departments
  const engineering = await prisma.department.create({ data: { name: 'ENGINEERING', budget: 1000000 } });
  const operations = await prisma.department.create({ data: { name: 'OPERATIONS', budget: 800000 } });
  const hr = await prisma.department.create({ data: { name: 'HR', budget: 300000 } });

  // 2. Main Manager (Owner/Admin level for this context)
  const manager = await prisma.user.create({
    data: {
      email: 'aman10@gmail.com',
      passwordHash: managerPass,
      role: 'MANAGER', // User requested only Manager and Employees
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

  // 4. Integrated Projects (Linked to Manager)
  const project = await prisma.project.create({
    data: {
      name: 'Vision 2026 Dashboard',
      description: 'Strategic dashboard for corporate oversight and KPI tracking.',
      status: 'ACTIVE',
      budget: 250000,
      progress: 35,
      startDate: subDays(new Date(), 10),
      endDate: addDays(new Date(), 90),
      department: 'OPERATIONS',
      managerId: manager.id,
      createdById: manager.id,
    }
  });

  // 5. Linked Tasks (Assignee, Reporter, Project all connected)
  await prisma.task.createMany({
    data: [
      {
        title: 'Backend API Hardening',
        description: 'Verify all JWT logic and relationship integrity in the ORM layer.',
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

  // 6. Linked Payroll (Financial connection)
  await prisma.payrollRecord.createMany({
    data: [
      { userId: manager.id, month: 4, year: 2026, baseSalary: 12000, allowances: 2000, netSalary: 14000, isPaid: true, paidAt: new Date() },
      { userId: dev1.id, month: 4, year: 2026, baseSalary: 8000, allowances: 1000, netSalary: 9000, isPaid: false }
    ]
  });

  // 7. Linked Attendance (Daily logs)
  await prisma.attendanceRecord.createMany({
    data: [
      { userId: dev1.id, date: new Date(), status: 'PRESENT', checkIn: new Date() },
      { userId: hr1.id, date: new Date(), status: 'PRESENT', checkIn: new Date() }
    ]
  });

  console.log('✅ AMAN Production Seed Complete. System fully connected.');
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
