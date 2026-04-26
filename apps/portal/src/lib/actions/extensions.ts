'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from './auth';
import { revalidatePath } from 'next/cache';
import { logAction } from '@/lib/audit';

export async function requestExtension(taskId: string, requestedDate: string, reason: string) {
  const session = await getSession();
  if (!session) return { success: false, message: 'Unauthorized' };

  try {
    const request = await (prisma as any).extensionRequest.create({
      data: {
        taskId,
        reason,
        requestedDate: new Date(requestedDate),
        status: 'PENDING',
      },
    });

    await logAction({
      userId: session.userId,
      action: 'CREATE',
      entity: 'extension_requests',
      entityId: request.id,
      newValues: { taskId, requestedDate, reason },
    });

    revalidatePath('/tasks');
    return { success: true, data: request };
  } catch (err) {
    return { success: false, message: 'Failed to request extension' };
  }
}

export async function getPendingExtensions() {
  const session = await getSession();
  if (!session) return { success: false, message: 'Unauthorized' };

  try {
    const requests = await (prisma as any).extensionRequest.findMany({
      where: { status: 'PENDING' },
      include: {
        task: {
          select: { title: true, dueDate: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, data: requests };
  } catch (err) {
    return { success: false, message: 'Failed to fetch extensions' };
  }
}

export async function approveExtension(requestId: string, approve: boolean) {
  const session = await getSession();
  if (!session) return { success: false, message: 'Unauthorized' };

  try {
    // Attempting to use the newly generated extensionRequest model
    const request = await (prisma as any).extensionRequest.findUnique({
      where: { id: requestId },
      include: { task: true },
    });

    if (!request) return { success: false, message: 'Request not found' };

    const status = approve ? 'APPROVED' : 'REJECTED';

    const updated = await (prisma as any).extensionRequest.update({
      where: { id: requestId },
      data: {
        status,
        approvedById: session.userId,
      },
    });

    if (approve) {
      await prisma.task.update({
        where: { id: request.taskId },
        data: { dueDate: request.requestedDate },
      });
    }

    await logAction({
      userId: session.userId,
      action: 'UPDATE',
      entity: 'extension_requests',
      entityId: requestId,
      newValues: { status },
    });

    revalidatePath('/tasks');
    revalidatePath('/dashboard');
    return { success: true, data: updated };
  } catch (err) {
    return { success: false, message: 'Action failed' };
  }
}
