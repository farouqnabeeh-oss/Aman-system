import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { toIUserPublic } from '../common/utils/mapping-utils';
import type {
  IDashboardKPIs, IRevenueDataPoint, IDepartmentPerformance, IRecentActivity,
  Department,
} from '@ems/shared';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getKPIs(): Promise<IDashboardKPIs> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const [
      totalRevenueThisMonth,
      totalRevenueLastMonth,
      activeUsers,
      newUsersThisMonth,
      pendingTasks,
      tasksCompletedThisMonth,
      overdueInvoices,
    ] = await Promise.all([
      this.prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { type: 'INCOME', status: 'COMPLETED', transactionDate: { gte: startOfMonth } },
      }),
      this.prisma.transaction.aggregate({
        _sum: { amount: true },
        where: { type: 'INCOME', status: 'COMPLETED', transactionDate: { gte: startOfLastMonth, lte: endOfLastMonth } },
      }),
      this.prisma.user.count({ where: { status: 'ACTIVE', deletedAt: null } }),
      this.prisma.user.count({ where: { createdAt: { gte: startOfMonth }, deletedAt: null } }),
      this.prisma.task.count({ where: { status: { in: ['TODO', 'IN_PROGRESS', 'IN_REVIEW'] }, deletedAt: null } }),
      this.prisma.task.count({ where: { status: 'DONE', completedAt: { gte: startOfMonth } } }),
      this.prisma.invoice.findMany({ where: { status: 'OVERDUE' }, select: { total: true } }),
    ]);

    const thisMonthRevenue = Number(totalRevenueThisMonth._sum.amount ?? 0);
    const lastMonthRevenue = Number(totalRevenueLastMonth._sum.amount ?? 0);
    const revenueGrowth = lastMonthRevenue > 0
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
      : 0;

    return {
      totalRevenue: thisMonthRevenue,
      revenueGrowth: Math.round(revenueGrowth * 10) / 10,
      activeUsers,
      newUsersThisMonth,
      pendingTasks,
      tasksCompletedThisMonth,
      overdueInvoices: overdueInvoices.length,
      overdueAmount: overdueInvoices.reduce((s, i) => s + Number(i.total), 0),
    };
  }

  async getRevenueChart(): Promise<IRevenueDataPoint[]> {
    const now = new Date();
    const points: IRevenueDataPoint[] = [];

    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

      const [income, expense] = await Promise.all([
        this.prisma.transaction.aggregate({
          _sum: { amount: true },
          where: { type: 'INCOME', status: 'COMPLETED', transactionDate: { gte: start, lte: end } },
        }),
        this.prisma.transaction.aggregate({
          _sum: { amount: true },
          where: { type: 'EXPENSE', status: 'COMPLETED', transactionDate: { gte: start, lte: end } },
        }),
      ]);

      const revenue = Number(income._sum.amount ?? 0);
      const expenses = Number(expense._sum.amount ?? 0);
      points.push({
        month: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        revenue,
        expenses,
        profit: revenue - expenses,
      });
    }

    return points;
  }

  async getDepartmentPerformance(): Promise<IDepartmentPerformance[]> {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    const [budgets, userCounts, projectCounts] = await Promise.all([
      this.prisma.budgetAllocation.findMany({ where: { period: 'MONTHLY', year, month } }),
      this.prisma.user.groupBy({ by: ['department'], _count: true, where: { deletedAt: null, status: 'ACTIVE', department: { not: null } } }),
      this.prisma.project.groupBy({ by: ['department'], _count: true, where: { deletedAt: null, status: 'ACTIVE', department: { not: null } } }),
    ]);

    return budgets.map((b) => {
      const allocated = Number(b.allocated);
      const spent = Number(b.spent);
      const dept = b.department;
      const empCount = userCounts.find((u) => u.department === dept)?._count ?? 0;
      const projCount = projectCounts.find((p) => p.department === dept)?._count ?? 0;
      return {
        department: dept as Department,
        budgetAllocated: allocated,
        budgetSpent: spent,
        utilizationPercent: allocated > 0 ? Math.round((spent / allocated) * 100) : 0,
        employeeCount: empCount,
        activeProjects: projCount,
      };
    });
  }

  async getRecentActivity(limit = 15): Promise<IRecentActivity[]> {
    const logs = await this.prisma.auditLog.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true, role: true, department: true, position: true } },
      },
    });

    return logs.map((log) => ({
      id: log.id,
      action: log.action,
      entity: log.entity,
      entityId: log.entityId,
      user: toIUserPublic(log.user),
      createdAt: log.createdAt.toISOString(),
    }));
  }
}
