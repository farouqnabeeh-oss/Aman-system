'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from './auth';

export async function getEntityLogs(entity: string, entityId: string) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
    const logs = await prisma.auditLog.findMany({
      where: { entity, entityId },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { firstName: true, lastName: true } } },
      take: 20
    });

    return {
      success: true,
      data: logs.map(l => ({
        id: l.id,
        user: l.user ? `${l.user.firstName} ${l.user.lastName}` : 'System',
        action: l.action,
        time: l.createdAt,
        details: l.newValues ? JSON.parse(l.newValues as string) : null
      }))
    };
  } catch (err) {
    return { success: false, error: 'Failed to fetch entity logs' };
  }
}
