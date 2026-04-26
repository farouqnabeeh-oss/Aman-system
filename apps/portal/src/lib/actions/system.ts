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
