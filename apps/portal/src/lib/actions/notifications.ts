'use server';

import prisma from '@/lib/prisma';
import { getSession } from './auth';
import { revalidatePath } from 'next/cache';

export async function getNotifications() {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: session.userId, isRead: false }
    });

    return { success: true, data: { notifications, unreadCount } };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function markAsRead(id: string) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
    await prisma.notification.update({
      where: { id, userId: session.userId },
      data: { isRead: true }
    });
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
