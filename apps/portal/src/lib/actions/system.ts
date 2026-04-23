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
      take: 50,
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

export async function getAuditLogs() {
  const session = await getSession();
  if (!session || session.role !== 'ROOT') return { success: false, message: 'Unauthorized' };

  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
      },
      take: 100,
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
