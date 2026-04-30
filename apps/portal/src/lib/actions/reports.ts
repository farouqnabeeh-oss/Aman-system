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

    // 3. Top Employees
    const topEmployees = await prisma.user.findMany({
        take: 5,
        where: { deletedAt: null },
        include: {
            _count: {
                select: { assignedTasks: { where: { status: 'DONE', updatedAt: { gte: startDate } } } }
            }
        }
    });

    const employeeStats = topEmployees.map(u => ({
        id: u.id,
        name: `${u.firstName} ${u.lastName}`,
        department: u.department,
        tasksDone: u._count.assignedTasks,
        avgRating: 5 // Defaulted since ratings are removed
    })).sort((a, b) => b.tasksDone - a.tasksDone);

    // 4. Departmental Load
    const departments = ['SOCIAL_MEDIA', 'DESIGN', 'DEVELOPMENT', 'SALES'];
    const deptLoad = await Promise.all(departments.map(async (d) => {
        const count = await prisma.task.count({ where: { project: { department: d as any }, status: { not: 'DONE' } } });
        return { department: d, count };
    }));

    // 5. Timeline Fidelity (On time vs Late)
    const onTime = await prisma.task.count({ where: { status: 'DONE', updatedAt: { lte: prisma.task.fields.dueDate } as any } });
    const totalDone = await prisma.task.count({ where: { status: 'DONE' } });

    return { 
        success: true, 
        data: {
            period,
            tasks,
            avgRating: 5,
            totalRatings: 0,
            topEmployees: employeeStats,
            deptLoad,
            fidelity: totalDone > 0 ? (onTime / totalDone) * 100 : 100
        } 
    };
  } catch (err) {
    return { success: false, message: 'Failed to generate report' };
  }
}
