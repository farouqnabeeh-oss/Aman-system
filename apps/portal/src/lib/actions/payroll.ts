'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from './auth';
import { logAction } from '@/lib/audit';
import { revalidatePath } from 'next/cache';

async function createNotification(userId: string, type: string, title: string, message: string, actionUrl?: string) {
  try {
    await prisma.notification.create({ data: { userId, type, title, message, actionUrl } });
  } catch (e) { console.error('Notification error:', e); }
}

export async function getPayrollRecords() {
  const session = await getSession();
  if (!session) return { success: false, message: 'Unauthorized' };

  try {
    const isManager = ['ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(session.role);
    const where = isManager ? {} : { userId: session.userId };

    const records = await prisma.payrollRecord.findMany({
      where,
      include: {
        user: { select: { firstName: true, lastName: true, employeeNumber: true, position: true, department: true } },
      },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
    return { success: true, data: records };
  } catch (err) {
    return { success: false, message: 'Failed to fetch payroll' };
  }
}

export async function updatePayrollStatus(id: string, isPaid: boolean) {
  const session = await getSession();
  if (!session || !['ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(session.role)) {
    return { success: false, message: 'Unauthorized' };
  }

  try {
    const record = await prisma.payrollRecord.update({
      where: { id },
      data: { isPaid, paidAt: isPaid ? new Date() : null, processedById: session.userId },
      include: { user: { select: { id: true, firstName: true } } },
    });

    if (isPaid) {
      await createNotification(
        record.user.id,
        'INFO',
        '💰 تم صرف راتبك',
        `تم تحويل راتب شهر ${record.month}/${record.year} إلى حسابك بنجاح.`,
        '/payroll'
      );
    }

    await logAction({
      userId: session.userId,
      action: 'UPDATE',
      entity: 'PayrollRecord',
      entityId: id,
      newValues: { isPaid, paidAt: isPaid ? new Date().toISOString() : null },
    });

    revalidatePath('/payroll');
    return { success: true };
  } catch (err) {
    return { success: false, message: 'Failed to update payroll' };
  }
}

export async function createPayrollRecord(data: {
  userId: string;
  month: number;
  year: number;
  baseSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  notes?: string;
}) {
  const session = await getSession();
  if (!session || !['ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(session.role)) {
    return { success: false, message: 'Unauthorized' };
  }

  // Validate required fields
  if (!data.userId) return { success: false, message: 'Employee is required' };
  if (!data.month || data.month < 1 || data.month > 12) return { success: false, message: 'Invalid month' };
  if (!data.year || data.year < 2000) return { success: false, message: 'Invalid year' };
  if (data.baseSalary <= 0) return { success: false, message: 'Base salary must be greater than 0' };

  try {
    const record = await prisma.payrollRecord.create({
      data: {
        userId: data.userId,
        month: data.month,
        year: data.year,
        baseSalary: data.baseSalary,
        allowances: data.allowances || 0,
        deductions: data.deductions || 0,
        netSalary: data.netSalary,
        notes: data.notes,
        processedById: session.userId,
        isPaid: false,
      },
      include: { user: { select: { id: true, firstName: true, lastName: true } } },
    });

    // Notify the employee
    await createNotification(
      record.user.id,
      'INFO',
      '📋 تم إنشاء سجل راتبك',
      `تم إنشاء سجل راتب شهر ${data.month}/${data.year} بمبلغ ₪${data.netSalary.toLocaleString()} (قيد الانتظار).`,
      '/payroll'
    );

    await logAction({
      userId: session.userId,
      action: 'CREATE',
      entity: 'PayrollRecord',
      entityId: record.id,
      newValues: { userId: data.userId, month: data.month, year: data.year, netSalary: data.netSalary },
    });

    revalidatePath('/payroll');
    return { success: true, data: record };
  } catch (err: any) {
    console.error('Create payroll error:', err);
    if (err.code === 'P2002') {
      return { success: false, message: 'A payroll record for this employee, month, and year already exists.' };
    }
    return { success: false, message: 'Failed to create payroll record' };
  }
}
