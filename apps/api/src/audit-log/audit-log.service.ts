import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { toIUserPublic } from '../common/utils/mapping-utils';

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

@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  async log(params: LogParams): Promise<void> {
    await this.prisma.auditLog.create({
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
  }

  async findAll(page = 1, limit = 20, filters?: { userId?: string; entity?: string; action?: string }) {
    const where = {
      ...(filters?.userId ? { userId: filters.userId } : {}),
      ...(filters?.entity ? { entity: filters.entity } : {}),
      ...(filters?.action ? { action: filters.action } : {}),
    };
    const [total, items] = await Promise.all([
      this.prisma.auditLog.count({ where }),
      this.prisma.auditLog.findMany({
        where,
        include: { user: { select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true, role: true, department: true, position: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      items: items.map((log) => ({
        ...log,
        user: toIUserPublic(log.user),
        oldValues: log.oldValues ? (JSON.parse(log.oldValues) as Record<string, unknown>) : null,
        newValues: log.newValues ? (JSON.parse(log.newValues) as Record<string, unknown>) : null,
      })),
      total,
    };
  }
}
