'use server';

import prisma from '@/lib/prisma';
import { getSession } from './auth';
import { revalidatePath } from 'next/cache';

export async function createAnnouncement(data: {
  title: string;
  content: string;
  targetType: 'ALL' | 'INDIVIDUAL';
  targetId?: string;
  priority: string;
}) {
  try {
    const session = await getSession();
    if (!session || !['ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(session.role)) {
      return { success: false, message: 'Unauthorized' };
    }

    const announcement = await prisma.announcement.create({
      data: {
        title: data.title,
        content: data.content,
        targetType: data.targetType,
        targetId: data.targetId,
        priority: data.priority,
        authorId: session.userId,
      },
    });

    // Create notifications for targeted users
    if (data.targetType === 'ALL') {
      const users = await prisma.user.findMany({
        where: { deletedAt: null },
        select: { id: true }
      });
      
      await prisma.notification.createMany({
        data: users.map(u => ({
          userId: u.id,
          title: `إعلان جديد: ${data.title}`,
          message: data.content,
          type: data.priority === 'URGENT' ? 'URGENT' : 'INFO',
        }))
      });
    } else if (data.targetType === 'INDIVIDUAL' && data.targetId) {
      await prisma.notification.create({
        data: {
          userId: data.targetId,
          title: `تنبيه خاص: ${data.title}`,
          message: data.content,
          type: data.priority === 'URGENT' ? 'URGENT' : 'INFO',
        }
      });
    }

    revalidatePath('/dashboard');
    return { success: true, data: announcement };
  } catch (error: any) {
    console.error('Failed to create announcement:', error);
    return { success: false, message: error.message || 'Failed to create announcement' };
  }
}
