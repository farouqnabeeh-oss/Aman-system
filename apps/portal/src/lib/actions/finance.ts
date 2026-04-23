'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from './auth';
import { logAction } from '@/lib/audit';
import { CreateTransactionSchema } from '@ems/shared';

// -- Overview / Summary --
export async function getFinanceSummary() {
  const session = await getSession();
  if (!session) return { success: false, message: 'Unauthorized' };

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
    return { success: false, message: 'Failed to fetch finance summary' };
  }
}

// -- Transactions --
export async function getTransactions() {
  const session = await getSession();
  if (!session) return { success: false, message: 'Unauthorized' };

  try {
    const items = await prisma.transaction.findMany({
      orderBy: { transactionDate: 'desc' },
      take: 50,
    });
    return { success: true, data: items };
  } catch (err) {
    return { success: false, message: 'Failed to fetch transactions' };
  }
}

export async function createTransaction(formData: any) {
  const session = await getSession();
  if (!session || (session.role !== 'ROOT' && session.role !== 'ADMIN' && session.role !== 'MANAGER')) {
    return { success: false, message: 'Unauthorized' };
  }

  const validated = CreateTransactionSchema.safeParse(formData);
  if (!validated.success) return { success: false, error: validated.error.flatten().fieldErrors };

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
    return { success: true, transaction };
  } catch (error) {
    return { success: false, message: 'Failed to create transaction' };
  }
}

// -- Budgets --
export async function getBudgets() {
  const session = await getSession();
  if (!session) return { success: false, message: 'Unauthorized' };

  try {
    const budgets = await prisma.budgetAllocation.findMany({
      where: { year: new Date().getFullYear() },
    });
    return { success: true, data: budgets };
  } catch (err) {
    return { success: false, message: 'Failed to fetch budgets' };
  }
}
