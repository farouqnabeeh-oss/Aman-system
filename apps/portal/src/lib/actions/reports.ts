'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from './auth';

export async function getPerformanceReport(period: 'weekly' | 'monthly') {
  const session = await getSession();
  if (!session) return { success: false, message: 'Unauthorized' };

  try {
    const now = new Date();
    const startDate = period === 'weekly' 
        ? new Date(now.setDate(now.getDate() - 7)) 
        : new Date(now.setMonth(now.getMonth() - 1));

    // 1. Task Completion Stats
    const tasks = await prisma.task.groupBy({
      by: ['status'],
      where: { createdAt: { gte: startDate } },
      _count: { _all: true }
    });

    // 2. Average Ratings
    const ratings = await prisma.rating.aggregate({
      where: { createdAt: { gte: startDate } },
      _avg: { stars: true },
      _count: { _all: true }
    });

    // 3. Top Employees
    const topEmployees = await prisma.user.findMany({
        take: 5,
        where: { deletedAt: null },
        include: {
            _count: {
                select: { assignedTasks: { where: { status: 'DONE', updatedAt: { gte: startDate } } } }
            },
            receivedRatings: {
                where: { createdAt: { gte: startDate } },
                select: { stars: true }
            }
        }
    });

    const employeeStats = topEmployees.map(u => ({
        id: u.id,
        name: `${u.firstName} ${u.lastName}`,
        department: u.department,
        tasksDone: u._count.assignedTasks,
        avgRating: u.receivedRatings.reduce((acc, curr) => acc + curr.stars, 0) / (u.receivedRatings.length || 1)
    })).sort((a, b) => b.tasksDone - a.tasksDone);

    return { 
        success: true, 
        data: {
            period,
            tasks,
            avgRating: ratings._avg.stars || 0,
            totalRatings: ratings._count._all,
            topEmployees: employeeStats
        } 
    };
  } catch (err) {
    return { success: false, message: 'Failed to generate report' };
  }
}
