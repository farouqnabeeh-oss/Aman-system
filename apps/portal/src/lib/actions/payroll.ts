'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from './auth';
import { revalidatePath } from 'next/cache';

export async function getPayrollRecords() {
  const session = await getSession();
  if (!session) return { success: false, message: 'Unauthorized' };

  try {
    const records = await prisma.payrollRecord.findMany({
      include: {
        user: { select: { firstName: true, lastName: true, employeeNumber: true, position: true, department: true } },
      },
      orderBy: [
        { year: 'desc' },
        { month: 'desc' },
      ],
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
    await prisma.payrollRecord.update({
      where: { id },
      data: { 
        isPaid,
        paidAt: isPaid ? new Date() : null,
        processedById: session.userId
      },
    });
    revalidatePath('/payroll');
    return { success: true };
  } catch (err) {
    return { success: false, message: 'Failed to update payroll' };
  }
}

export async function createPayrollRecord(data: any) {
  const session = await getSession();
  if (!session || !['ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(session.role)) {
    return { success: false, message: 'Unauthorized' };
  }

  try {
    const record = await prisma.payrollRecord.create({
      data: {
        ...data,
        processedById: session.userId
      },
    });
    revalidatePath('/payroll');
    return { success: true, data: record };
  } catch (err) {
    return { success: false, message: 'Failed to create payroll record' };
  }
}
