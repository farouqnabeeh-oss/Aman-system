'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from './auth';
import { revalidatePath } from 'next/cache';
import { logAction } from '@/lib/audit';

export async function getSMClients() {
  const session = await getSession();
  if (!session) return { success: false, message: 'Unauthorized' };

  try {
    const clients = await prisma.client.findMany({
      where: { status: 'AGREED' },
      include: {
        smDetails: true,
      },
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

  try {
    const rating = await prisma.rating.create({
      data: {
        giverId: session.userId,
        receiverId,
        stars,
        comment,
      },
    });

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
  try {
    const ratings = await prisma.rating.findMany({
      where: { receiverId: userId },
      include: {
        giver: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, data: ratings };
  } catch (err) {
    return { success: false, message: 'Failed to fetch ratings' };
  }
}

export async function getDeptMembers() {
  const session = await getSession();
  if (!session) return { success: false, message: 'Unauthorized' };

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { department: true }
    });

    if (!user?.department) return { success: true, data: [] };

    const members = await prisma.user.findMany({
      where: { 
        department: user.department,
        id: { not: session.userId },
        deletedAt: null
      },
      select: { id: true, firstName: true, lastName: true, position: true }
    });

    return { success: true, data: members };
  } catch (err) {
    return { success: false, message: 'Failed to fetch members' };
  }
}
