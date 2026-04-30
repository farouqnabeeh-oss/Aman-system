'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from './auth';

export async function submitDailyReport(data: { done: string; plan: string; blocks?: string }) {
  const session = await getSession();
  if (!session) return { success: false, message: 'Unauthorized' };

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Upsert: update today's report if it already exists
    const existing = await prisma.dailyReport.findFirst({
      where: {
        userId: session.id,
        date: { gte: today, lt: tomorrow }
      }
    });

    if (existing) {
      await prisma.dailyReport.update({
        where: { id: existing.id },
        data: { done: data.done, plan: data.plan, blocks: data.blocks || '' }
      });
    } else {
      await prisma.dailyReport.create({
        data: {
          userId: session.id,
          done: data.done,
          plan: data.plan,
          blocks: data.blocks || ''
        }
      });
    }

    return { success: true };
  } catch (err) {
    return { success: false, message: 'Failed to submit report' };
  }
}

export async function getMyDailyReports() {
  const session = await getSession();
  if (!session) return { success: false, data: [] };

  try {
    const reports = await prisma.dailyReport.findMany({
      where: { userId: session.id },
      orderBy: { date: 'desc' },
      take: 10
    });
    return { success: true, data: reports };
  } catch {
    return { success: false, data: [] };
  }
}

export async function getAllDailyReports(date?: string) {
  const session = await getSession();
  if (!session || !['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(session.role)) {
    return { success: false, message: 'Unauthorized' };
  }

  try {
    const filterDate = date ? new Date(date) : new Date();
    filterDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(filterDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const reports = await prisma.dailyReport.findMany({
      where: { date: { gte: filterDate, lt: nextDay } },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, department: true, position: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return { success: true, data: reports };
  } catch {
    return { success: false, data: [] };
  }
}

export async function getTodayMyReport() {
  const session = await getSession();
  if (!session) return { success: false, data: null };

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const report = await prisma.dailyReport.findFirst({
      where: { userId: session.id, date: { gte: today, lt: tomorrow } }
    });
    return { success: true, data: report };
  } catch {
    return { success: false, data: null };
  }
}
