'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from './auth';

export async function getDashboardStats() {
  const session = await getSession();
  if (!session) return { success: false, message: 'Unauthorized' };

  try {
    const [
      userCount,
      projectCount,
      taskCount,
      revenueStats,
      recentLogs
    ] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.project.count({ where: { deletedAt: null } }),
      prisma.task.count({ where: { status: { not: 'DONE' }, deletedAt: null } }),
      prisma.transaction.aggregate({
        where: { type: 'INCOME', status: 'COMPLETED' },
        _sum: { amount: true }
      }),
      prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { user: { select: { firstName: true, lastName: true } } }
      })
    ]);

    return {
      success: true,
      data: {
        userCount,
        projectCount,
        taskCount,
        totalRevenue: revenueStats._sum.amount || 0,
        recentLogs: recentLogs.map(log => ({
          id: log.id,
          user: log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System',
          action: log.action.toLowerCase(),
          entity: log.entity,
          time: log.createdAt
        }))
      }
    };
  } catch (err) {
    return { success: false, message: 'Failed to fetch dashboard stats' };
  }
}
