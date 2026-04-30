'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from './auth';
import { revalidatePath } from 'next/cache';

export async function getRatingsForUser(userId: string) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
    const ratings = await prisma.rating.findMany({
      where: { receiverId: userId },
      include: {
        giver: { select: { id: true, firstName: true, lastName: true, role: true, department: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const avg = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.stars, 0) / ratings.length
      : 0;

    return { success: true, data: { ratings, avg: Math.round(avg * 10) / 10 } };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function getMyRatings() {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };
  return getRatingsForUser(session.userId);
}

export async function getAllUsersWithRatings() {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
    const users = await prisma.user.findMany({
      where: { deletedAt: null, status: 'ACTIVE' },
      select: {
        id: true, firstName: true, lastName: true,
        role: true, department: true, position: true,
        receivedRatings: { select: { stars: true } },
      },
      orderBy: { firstName: 'asc' },
    });

    const result = users.map(u => ({
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      role: u.role,
      department: u.department,
      position: u.position,
      ratingsCount: u.receivedRatings.length,
      avgRating: u.receivedRatings.length > 0
        ? Math.round((u.receivedRatings.reduce((s, r) => s + r.stars, 0) / u.receivedRatings.length) * 10) / 10
        : 0,
    }));

    return { success: true, data: result };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function submitRating(receiverId: string, stars: number, comment: string) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };

  if (receiverId === session.userId) {
    return { success: false, error: 'Cannot rate yourself' };
  }
  if (stars < 1 || stars > 5) {
    return { success: false, error: 'Stars must be between 1 and 5' };
  }

  try {
    // Check if already rated this user recently (last 30 days)
    const existing = await prisma.rating.findFirst({
      where: {
        giverId: session.userId,
        receiverId,
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
    });

    let rating;
    if (existing) {
      // Update existing rating
      rating = await prisma.rating.update({
        where: { id: existing.id },
        data: { stars, comment },
      });
    } else {
      // Create new rating
      rating = await prisma.rating.create({
        data: {
          giverId: session.userId,
          receiverId,
          stars,
          comment,
        },
      });

      // Notify the rated user
      await prisma.notification.create({
        data: {
          userId: receiverId,
          type: 'INFO',
          title: 'New Performance Rating',
          message: `You received a ${stars}-star rating from a colleague`,
        },
      });
    }

    revalidatePath('/ratings');
    return { success: true, data: rating, updated: !!existing };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function getMyGivenRatings() {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
    const ratings = await prisma.rating.findMany({
      where: { giverId: session.userId },
      include: {
        receiver: { select: { id: true, firstName: true, lastName: true, role: true, department: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: ratings };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
