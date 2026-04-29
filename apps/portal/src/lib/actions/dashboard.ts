'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from './auth';

export async function getDashboardStats() {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      userCount,
      projectCount,
      taskCount,
      financeStats,
      recentLogs,
      attendanceToday,
      projectStatusCounts,
      taskPriorityCounts,
      latestAnnouncement,
      unreadCount
    ] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.project.count({ where: { deletedAt: null } }),
      prisma.task.count({ where: { status: { not: 'DONE' }, deletedAt: null } }),
      prisma.transaction.groupBy({
        by: ['type'],
        where: { status: 'COMPLETED' },
        _sum: { amount: true }
      }),
      prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 8,
        include: { user: { select: { firstName: true, lastName: true } } }
      }),
      prisma.attendanceRecord.count({
        where: { date: { gte: today }, status: 'PRESENT' }
      }),
      prisma.project.groupBy({
        by: ['status'],
        where: { deletedAt: null },
        _count: true
      }),
      prisma.task.groupBy({
        by: ['priority'],
        where: { deletedAt: null, status: { not: 'DONE' } },
        _count: true
      }),
      prisma.announcement.findFirst({
        where: {
          OR: [
            { targetType: 'ALL' },
            { targetType: 'INDIVIDUAL', targetId: session.userId }
          ]
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.notification.count({
        where: { userId: session.userId, isRead: false }
      })
    ]);

    const income = Number(financeStats.find(f => f.type === 'INCOME')?._sum.amount || 0);
    const expenses = Number(financeStats.find(f => f.type === 'EXPENSE')?._sum.amount || 0);

    return {
      success: true,
      data: {
        userCount,
        projectCount,
        taskCount,
        income,
        expenses,
        profit: income - expenses,
        attendanceToday,
        projectStatusCounts: projectStatusCounts.map((p: any) => ({ status: p.status, count: p._count })),
        taskPriorityCounts: taskPriorityCounts.map((t: any) => ({ priority: t.priority, count: t._count })),
        recentLogs: recentLogs.map((log: any) => ({
          id: log.id,
          user: log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System',
          action: log.action.toLowerCase(),
          entity: log.entity,
          time: log.createdAt
        })),
        latestAnnouncement,
        unreadCount
      }
    };
  } catch (err) {
    return { success: false, error: 'Failed to fetch dashboard stats' };
  }
}
