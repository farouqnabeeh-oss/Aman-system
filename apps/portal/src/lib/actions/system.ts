'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from './auth';

export async function getNotifications() {
  const session = await getSession();
  if (!session) return { success: false, message: 'Unauthorized' };

  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return { success: true, data: notifications };
  } catch (err) {
    return { success: false, message: 'Failed to fetch notifications' };
  }
}

export async function markAsRead(id: string) {
  const session = await getSession();
  if (!session) return { success: false, message: 'Unauthorized' };

  try {
    await prisma.notification.updateMany({
      where: { id, userId: session.userId },
      data: { isRead: true },
    });
    return { success: true };
  } catch (err) {
    return { success: false, message: 'Failed to mark as read' };
  }
}

export async function markAllNotificationsRead() {
  const session = await getSession();
  if (!session) return { success: false, message: 'Unauthorized' };

  try {
    await prisma.notification.updateMany({
      where: { userId: session.userId, isRead: false },
      data: { isRead: true },
    });
    return { success: true };
  } catch (err) {
    return { success: false, message: 'Failed to mark all as read' };
  }
}

export async function getUnreadCount() {
  const session = await getSession();
  if (!session) return { success: false, data: 0 };

  try {
    const count = await prisma.notification.count({
      where: { userId: session.userId, isRead: false },
    });
    return { success: true, data: count };
  } catch {
    return { success: false, data: 0 };
  }
}

export async function getAuditLogs() {
  const session = await getSession();
  if (!session || !['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(session.role)) {
    return { success: false, message: 'Unauthorized' };
  }

  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
      },
      take: 200,
    });

    const mapped = logs.map(l => ({
      ...l,
      userName: l.user ? `${l.user.firstName} ${l.user.lastName}` : 'System',
    }));

    return { success: true, data: mapped };
  } catch (err) {
    return { success: false, message: 'Failed to fetch audit logs' };
  }
}

export async function globalSearch(query: string) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  if (!query || query.length < 2) return { success: true, data: [] };

  try {
    const [users, projects, tasks, transactions] = await Promise.all([
      prisma.user.findMany({
        where: {
          OR: [
            { firstName: { contains: query, mode: 'insensitive' } },
            { lastName: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
            { employeeNumber: { contains: query, mode: 'insensitive' } },
          ],
          deletedAt: null,
        },
        select: { id: true, firstName: true, lastName: true, role: true, department: true },
        take: 5,
      }),
      prisma.project.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
          deletedAt: null,
        },
        select: { id: true, name: true, status: true, department: true },
        take: 5,
      }),
      prisma.task.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
          deletedAt: null,
        },
        select: { id: true, title: true, status: true, projectId: true },
        take: 5,
      }),
      prisma.transaction.findMany({
        where: {
          OR: [
            { description: { contains: query, mode: 'insensitive' } },
            { reference: { contains: query, mode: 'insensitive' } },
          ],
          deletedAt: null,
        },
        select: { id: true, description: true, amount: true, type: true, transactionDate: true },
        take: 5,
      }),
    ]);

    const results = [
      ...users.map(u => ({ id: u.id, type: 'USER', title: `${u.firstName} ${u.lastName}`, subtitle: `${u.role} · ${u.department}`, url: `/users` })),
      ...projects.map(p => ({ id: p.id, type: 'PROJECT', title: p.name, subtitle: `${p.status} · ${p.department}`, url: `/projects` })),
      ...tasks.map(t => ({ id: t.id, type: 'TASK', title: t.title, subtitle: t.status, url: `/tasks` })),
      ...transactions.map(tx => ({ id: tx.id, type: 'TRANSACTION', title: tx.description, subtitle: `${tx.type} · ₪${tx.amount}`, url: `/finance` })),
    ];

    return { success: true, data: results };
  } catch (error) {
    return { success: false, error: 'Search failed' };
  }
}
