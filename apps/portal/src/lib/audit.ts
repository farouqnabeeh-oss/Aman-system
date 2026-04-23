import { prisma } from './prisma';

interface LogParams {
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export async function logAction(params: LogParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        oldValues: params.oldValues ? JSON.stringify(params.oldValues) : undefined,
        newValues: params.newValues ? JSON.stringify(params.newValues) : undefined,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      },
    });
  } catch (error) {
    console.error('Audit log failure:', error);
    // We don't throw here to avoid breaking the main transaction/action 
    // unless strictly required by business logic.
  }
}
