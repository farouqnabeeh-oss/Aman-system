'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from './auth';
import { logAction } from '@/lib/audit';
import { CreateTransactionSchema } from '@ems/shared';

import { revalidatePath } from 'next/cache';

// -- Overview / Summary --
export async function getFinanceSummary() {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
    const transactions = await prisma.transaction.findMany({
      where: { status: 'COMPLETED' },
      select: { amount: true, type: true },
    });

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach((tx) => {
      const amount = Number(tx.amount);
      if (tx.type === 'INCOME') totalIncome += amount;
      if (tx.type === 'EXPENSE') totalExpense += amount;
    });

    const netProfit = totalIncome - totalExpense;
    const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

    const invoices = await prisma.invoice.groupBy({
      by: ['status'],
      _count: true,
    });

    return {
      success: true,
      data: {
        totalIncome,
        totalExpense,
        netProfit,
        profitMargin,
        invoicesByStatus: invoices.map(i => ({ status: i.status, _count: i._count })),
      },
    };
  } catch (err) {
    return { success: false, error: 'Failed to fetch finance summary' };
  }
}

// -- Transactions --
export async function getTransactions() {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
    const items = await prisma.transaction.findMany({
      orderBy: { transactionDate: 'desc' },
      take: 50,
    });
    return { success: true, data: items };
  } catch (err) {
    return { success: false, error: 'Failed to fetch transactions' };
  }
}

export async function createTransaction(formData: any) {
  const session = await getSession();
  if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN' && session.role !== 'MANAGER')) {
    return { success: false, error: 'Unauthorized' };
  }

  const validated = CreateTransactionSchema.safeParse(formData);
  if (!validated.success) {
    return { success: false, error: validated.error.errors.map(e => e.message).join(', ') };
  }

  try {
    const transaction = await prisma.transaction.create({
      data: {
        ...validated.data,
        createdById: session.userId,
      },
    });
    await logAction({
      userId: session.userId,
      action: 'CREATE',
      entity: 'Transaction',
      entityId: transaction.id,
      newValues: transaction,
    });
    revalidatePath('/finance');
    revalidatePath('/dashboard');
    return { success: true, data: transaction };
  } catch (error) {
    return { success: false, error: 'Failed to create transaction' };
  }
}

export async function deleteTransaction(id: string) {
  const session = await getSession();
  if (!session || !['ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(session.role)) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    await prisma.transaction.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'CANCELLED' } as any,
    });
    await logAction({
      userId: session.userId,
      action: 'DELETE',
      entity: 'Transaction',
      entityId: id,
    });
    revalidatePath('/finance');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (err) {
    return { success: false, error: 'Failed to delete transaction' };
  }
}

export async function updateTransaction(id: string, data: any) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
    const updated = await prisma.transaction.update({
      where: { id },
      data,
    });
    await logAction({
      userId: session.userId,
      action: 'UPDATE',
      entity: 'Transaction',
      entityId: id,
      newValues: updated,
    });
    revalidatePath('/finance');
    revalidatePath('/dashboard');
    return { success: true, data: updated };
  } catch (err) {
    return { success: false, error: 'Failed to update transaction' };
  }
}

// -- Budgets --
export async function getBudgets() {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
    const budgets = await prisma.budgetAllocation.findMany({
      where: { year: new Date().getFullYear() },
    });
    return { success: true, data: budgets };
  } catch (err) {
    return { success: false, error: 'Failed to fetch budgets' };
  }
}
export async function createBudget(data: any) {
  const session = await getSession();
  if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.role)) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const budget = await prisma.budgetAllocation.create({
      data: {
        ...data,
        year: data.year || new Date().getFullYear(),
      },
    });
    await logAction({
      userId: session.userId,
      action: 'CREATE',
      entity: 'Budget',
      entityId: budget.id,
      newValues: budget,
    });
    revalidatePath('/finance');
    return { success: true, data: budget };
  } catch (err) {
    return { success: false, error: 'Failed to create budget' };
  }
}

export async function updateBudget(id: string, data: any) {
  const session = await getSession();
  if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.role)) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const updated = await prisma.budgetAllocation.update({
      where: { id },
      data,
    });
    await logAction({
      userId: session.userId,
      action: 'UPDATE',
      entity: 'Budget',
      entityId: id,
      newValues: updated,
    });
    revalidatePath('/finance');
    return { success: true, data: updated };
  } catch (err) {
    return { success: false, error: 'Failed to update budget' };
  }
}

export async function deleteBudget(id: string) {
    const session = await getSession();
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.role)) {
      return { success: false, error: 'Unauthorized' };
    }
  
    try {
      await prisma.budgetAllocation.delete({ where: { id } });
      await logAction({
        userId: session.userId,
        action: 'DELETE',
        entity: 'Budget',
        entityId: id,
      });
      revalidatePath('/finance');
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Failed to delete budget' };
    }
  }
