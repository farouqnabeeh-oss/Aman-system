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
        brandGuideline: true,
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
    const current = await prisma.sMClientDetails.findUnique({ where: { clientId } });
    
    const updateData = {
      ...data,
      ...(data.content ? { lastEditorId: session.userId } : {})
    };

    const updated = await prisma.sMClientDetails.upsert({
      where: { clientId },
      update: updateData,
      create: {
        clientId,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        ...updateData,
      },
    });

    // Notify writer if manager requests rewrite
    if (data.contentStatus === 'REWRITE' && updated.lastEditorId) {
      await createNotification(
        updated.lastEditorId,
        'WARNING',
        'طلب تعديل محتوى',
        `تم طلب تعديل المحتوى للعميل رقم ${clientId}. يرجى المراجعة.`,
        '/content-writer'
      );
    }

    await logAction({
      userId: session.userId,
      action: 'UPDATE',
      entity: 'sm_client_details',
      entityId: clientId,
      newValues: updateData,
    });

    revalidatePath('/social-media');
    revalidatePath('/content-writer');
    revalidatePath('/page-manager');
    return { success: true, data: updated };
  } catch (err) {
    return { success: false, message: 'Failed to update details' };
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

    // Notify Creative Team
    const designers = await prisma.user.findMany({
      where: { 
        position: { in: ['DESIGNER', 'EDITOR', 'VIDEOGRAPHER', 'مصمم', 'مونتير'] },
        deletedAt: null
      },
      select: { id: true }
    });

    for (const d of designers) {
      await createNotification(
        d.id,
        'INFO',
        'مهمة إبداعية جديدة',
        `تمت إضافة مهمة [${data.type}] جديدة للعميل.`,
        '/creative-studio'
      );
    }

    await logAction({
      userId: session.userId,
      action: 'CREATE',
      entity: 'Task',
      entityId: task.id,
      newValues: { title: data.title, type: data.type }
    });

    revalidatePath('/social-media');
    revalidatePath('/creative-studio');
    return { success: true, data: task };
  } catch (error) {
    return { success: false, error: 'Failed to create task' };
  }
}
