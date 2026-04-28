'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from './auth';
import { logAction } from '@/lib/audit';
import { revalidatePath } from 'next/cache';

async function createNotification(userId: string, type: string, title: string, message: string, actionUrl?: string) {
  try {
    await prisma.notification.create({ data: { userId, type, title, message, actionUrl } });
  } catch (e) { console.error('Notification error:', e); }
}

export async function getSMClients() {
  const session = await getSession();
  if (!session) return { success: false, message: 'Unauthorized' };

  try {
    const clients = await prisma.client.findMany({
      where: { status: 'AGREED', deletedAt: null } as any,
      include: { 
        smDetails: true,
        projects: {
          include: {
            tasks: {
              where: { deletedAt: null },
              orderBy: { createdAt: 'desc' },
              take: 10
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: clients };
  } catch (err) {
    return { success: false, message: 'Failed to fetch clients' };
  }
}

export async function updateSMDetails(clientId: string, data: any) {
  const session = await getSession();
  if (!session) return { success: false, message: 'Unauthorized' };

  try {
    const updated = await prisma.sMClientDetails.upsert({
      where: { clientId },
      update: data,
      create: {
        clientId,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        ...data,
      },
    });

    await logAction({
      userId: session.userId,
      action: 'UPDATE',
      entity: 'sm_client_details',
      entityId: clientId,
      newValues: data,
    });

    revalidatePath('/social-media');
    return { success: true, data: updated };
  } catch (err) {
    return { success: false, message: 'Failed to update details' };
  }
}

export async function rateEmployee(receiverId: string, stars: number, comment?: string) {
  const session = await getSession();
  if (!session) return { success: false, message: 'Unauthorized' };

  if (receiverId === session.userId) {
    return { success: false, message: 'You cannot rate yourself' };
  }

  try {
    const rating = await prisma.rating.create({
      data: {
        giverId: session.userId,
        receiverId,
        stars,
        comment,
      },
    });

    // Notify the rated employee
    const giver = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { firstName: true, lastName: true },
    });

    const starEmoji = '⭐'.repeat(Math.min(stars, 5));
    await createNotification(
      receiverId,
      'INFO',
      `${starEmoji} تقييم جديد`,
      `${giver?.firstName} ${giver?.lastName} قيّمك بـ ${stars}/5 نجوم.${comment ? ` "${comment}"` : ''}`,
      '/social-media'
    );

    await logAction({
      userId: session.userId,
      action: 'CREATE',
      entity: 'ratings',
      entityId: rating.id,
      newValues: { stars, receiverId },
    });

    return { success: true, data: rating };
  } catch (err) {
    return { success: false, message: 'Failed to submit rating' };
  }
}

export async function getPeerRatings(userId: string) {
  const session = await getSession();
  const targetId = userId === 'current' ? session?.userId : userId;

  if (!targetId) return { success: false, message: 'Invalid User ID' };

  try {
    const ratings = await prisma.rating.findMany({
      where: { receiverId: targetId },
      include: {
        giver: { select: { firstName: true, lastName: true, position: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return { success: true, data: ratings };
  } catch (err) {
    return { success: false, message: 'Failed to fetch ratings' };
  }
}

export async function getMyRatings() {
  const session = await getSession();
  if (!session) return { success: false, message: 'Unauthorized' };

  try {
    const ratings = await prisma.rating.findMany({
      where: { receiverId: session.userId },
      include: {
        giver: { select: { firstName: true, lastName: true, position: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const avg = ratings.length > 0 
      ? ratings.reduce((acc, r) => acc + r.stars, 0) / ratings.length 
      : 0;

    return { success: true, data: { ratings, avgRating: avg, totalRatings: ratings.length } };
  } catch (err) {
    return { success: false, message: 'Failed to fetch my ratings' };
  }
}

export async function getDeptMembers() {
  const session = await getSession();
  if (!session) return { success: false, message: 'Unauthorized' };

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { department: true },
    });

    // If no department or super admin - return all users except self
    const members = await prisma.user.findMany({
      where: {
        ...(user?.department ? { department: user.department } : {}),
        id: { not: session.userId },
        deletedAt: null,
      },
      select: { id: true, firstName: true, lastName: true, position: true, department: true },
      orderBy: { firstName: 'asc' },
    });

    return { success: true, data: members };
  } catch (err) {
    return { success: false, message: 'Failed to fetch members' };
  }
}

export async function getSMStats() {
  const session = await getSession();
  if (!session) return { success: false, message: 'Unauthorized' };

  try {
    const [totalClients, pendingContent, approvedContent] = await Promise.all([
      prisma.sMClientDetails.count(),
      prisma.sMClientDetails.count({ where: { contentStatus: 'PENDING' } }),
      prisma.sMClientDetails.count({ where: { contentStatus: 'APPROVED' } }),
    ]);

    const designStats = await prisma.sMClientDetails.aggregate({
      _sum: { targetDesigns: true, doneDesigns: true, targetVideos: true, doneVideos: true },
    });

    return { success: true, data: { totalClients, pendingContent, approvedContent, totalDesigns: designStats._sum.targetDesigns || 0, doneDesigns: designStats._sum.doneDesigns || 0, totalVideos: designStats._sum.targetVideos || 0, doneVideos: designStats._sum.doneVideos || 0 } };
  } catch (err) {
    return { success: false, message: 'Failed to fetch stats' };
  }
}

export async function createSMTask(clientId: string, data: { title: string; description?: string; priority: string; type: 'DESIGN' | 'VIDEO' | 'CONTENT' }) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
    // Find or create a project for this client if not exists
    let project = await prisma.project.findFirst({
      where: { clientId, department: 'SOCIAL_MEDIA', deletedAt: null }
    });

    if (!project) {
      project = await prisma.project.create({
        data: {
          name: `Social Media - ${clientId}`,
          clientId,
          department: 'SOCIAL_MEDIA',
          managerId: session.userId,
          createdById: session.userId,
          startDate: new Date(),
          status: 'ACTIVE'
        }
      });
    }

    const task = await prisma.task.create({
      data: {
        title: `[${data.type}] ${data.title}`,
        description: data.description,
        priority: data.priority,
        projectId: project.id,
        reporterId: session.userId,
        status: 'TODO',
        tags: data.type
      }
    });

    await logAction({
      userId: session.userId,
      action: 'CREATE',
      entity: 'Task',
      entityId: task.id,
      newValues: { title: data.title, type: data.type }
    });

    revalidatePath('/social-media');
    return { success: true, data: task };
  } catch (error) {
    return { success: false, error: 'Failed to create task' };
  }
}
