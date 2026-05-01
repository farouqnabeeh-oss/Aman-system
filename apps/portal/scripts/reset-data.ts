/**
 * reset-data.ts - Clears all operational data from the database
 * Keeps the schema intact but deletes all records
 * Usage: npx tsx scripts/reset-data.ts
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

// Use DIRECT_URL (port 5432) to bypass pgbouncer which blocks local connections
process.env.DATABASE_URL = process.env.DIRECT_URL || process.env.DATABASE_URL;

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Starting database reset...');

  // Delete in dependency order (children first)
  await prisma.notification.deleteMany({});
  console.log('✅ Notifications cleared');

  await prisma.auditLog.deleteMany({});
  console.log('✅ Audit logs cleared');

  await prisma.dailyReport.deleteMany({});
  console.log('✅ Daily reports cleared');

  await prisma.taskComment.deleteMany({});
  console.log('✅ Task comments cleared');

  await prisma.extensionRequest.deleteMany({});
  console.log('✅ Extension requests cleared');

  await prisma.task.deleteMany({});
  console.log('✅ Tasks cleared');

  await prisma.project.deleteMany({});
  console.log('✅ Projects cleared');

  await prisma.filePermission.deleteMany({});
  await prisma.file.deleteMany({});
  console.log('✅ Files cleared');

  await prisma.invoiceLineItem.deleteMany({});
  await prisma.invoice.deleteMany({});
  console.log('✅ Invoices cleared');

  await prisma.transaction.deleteMany({});
  console.log('✅ Transactions cleared');

  await prisma.budgetAllocation.deleteMany({});
  console.log('✅ Budget allocations cleared');

  await (prisma as any).sMClientDetails.deleteMany({});
  await prisma.client.deleteMany({});
  console.log('✅ Clients cleared');

  await prisma.payrollRecord.deleteMany({});
  console.log('✅ Payroll records cleared');

  await prisma.leaveRequest.deleteMany({});
  console.log('✅ Leave requests cleared');

  await prisma.attendanceRecord.deleteMany({});
  console.log('✅ Attendance records cleared');

  await prisma.announcement.deleteMany({});
  console.log('✅ Announcements cleared');

  // Delete all users except super admin
  await prisma.user.deleteMany({
    where: { role: { not: 'SUPER_ADMIN' } }
  });
  console.log('✅ Non-admin users cleared');

  // Reset super admin password
  const hash = await bcrypt.hash('Aman2026!', 12);
  await prisma.user.updateMany({
    where: { role: 'SUPER_ADMIN' },
    data: {
      passwordHash: hash,
      refreshToken: null,
      lastLoginAt: null,
      deletedAt: null,
      status: 'ACTIVE',
    }
  });
  console.log('✅ Super admin password reset to: Aman2026!');

  const admin = await prisma.user.findFirst({ where: { role: 'SUPER_ADMIN' } });
  if (admin) {
    console.log(`\n📋 Super Admin Account:`);
    console.log(`   Employee Number: ${admin.employeeNumber}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Password: Aman2026!`);
  }

  console.log('\n🎉 Database reset complete! System is ready for fresh data.');
}

main()
  .catch(e => { console.error('❌ Reset failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
