'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from './auth';
import { revalidatePath } from 'next/cache';

export async function getAcquisitionStats() {
  try {
    const counts = await prisma.client.groupBy({
      by: ['status'],
      _count: true,
    });

    const stats = {
      POTENTIAL: 0,
      NEGOTIATING: 0,
      AGREED: 0,
    };

    counts.forEach((c) => {
      if (c.status in stats) {
        stats[c.status as keyof typeof stats] = c._count;
      }
    });

    return { success: true, data: stats };
  } catch (err) {
    return { success: false, message: 'Failed to fetch stats' };
  }
}

export async function getExpiringClients() {
  try {
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const clients = await prisma.client.findMany({
      where: {
        status: 'AGREED',
        smDetails: {
          endDate: {
            lte: sevenDaysFromNow,
          },
        },
      },
      include: {
        smDetails: true,
      },
      orderBy: {
        smDetails: {
          endDate: 'asc',
        },
      },
    });

    return { success: true, data: clients };
  } catch (err) {
    return { success: false, message: 'Failed to fetch expiring clients' };
  }
}

export async function createClientLead(data: any) {
  const session = await getSession();
  if (!session) return { success: false, message: 'Unauthorized' };

  try {
    const client = await prisma.client.create({
      data: {
        ...data,
        createdById: session.userId,
      },
    });

    revalidatePath('/acquisition');
    return { success: true, data: client };
  } catch (err) {
    return { success: false, message: 'Failed to create lead' };
  }
}

export async function updateClientStatus(clientId: string, status: string, packageDetails?: any) {
  const session = await getSession();
  if (!session) return { success: false, message: 'Unauthorized' };

  try {
    const client = await prisma.client.update({
      where: { id: clientId },
      data: { 
        status,
        ...(status === 'AGREED' && packageDetails ? {
          smDetails: {
            upsert: {
              create: {
                startDate: new Date(),
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 1 month
                ...packageDetails,
              },
              update: packageDetails,
            }
          }
        } : {})
      },
    });

    revalidatePath('/acquisition');
    revalidatePath('/social-media');
    return { success: true, data: client };
  } catch (err) {
    return { success: false, message: 'Failed to update status' };
  }
}

export async function getLeads() {
  try {
    const leads = await prisma.client.findMany({
      where: { deletedAt: null } as any,
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: leads };
  } catch (err) {
    return { success: false, message: 'Failed to fetch leads' };
  }
}

export async function deleteClient(id: string) {
  const session = await getSession();
  if (!session || !['ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(session.role)) {
    return { success: false, message: 'Unauthorized' };
  }

  try {
    await prisma.client.update({
      where: { id },
      data: { deletedAt: new Date() } as any,
    });
    revalidatePath('/acquisition');
    return { success: true };
  } catch (err) {
    return { success: false, message: 'Failed to delete client' };
  }
}

export async function updateClient(id: string, data: any) {
  const session = await getSession();
  if (!session) return { success: false, message: 'Unauthorized' };

  try {
    const updated = await prisma.client.update({
      where: { id },
      data,
    });
    revalidatePath('/acquisition');
    return { success: true, data: updated };
  } catch (err) {
    return { success: false, message: 'Failed to update client' };
  }
}
