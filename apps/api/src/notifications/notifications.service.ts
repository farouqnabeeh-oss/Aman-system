import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { NotificationType } from '@ems/shared';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string, onlyUnread = false) {
    const where = { userId, ...(onlyUnread ? { isRead: false } : {}) };
    const [items, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({ where, orderBy: { createdAt: 'desc' }, take: 50 }),
      this.prisma.notification.count({ where: { userId, isRead: false } }),
    ]);
    return { items: items.map((n) => ({ ...n, metadata: n.metadata ? (JSON.parse(n.metadata) as Record<string, unknown>) : null, createdAt: n.createdAt.toISOString() })), unreadCount };
  }

  async create(params: { userId: string; type: NotificationType; title: string; message: string; actionUrl?: string; metadata?: Record<string, unknown> }) {
    return this.prisma.notification.create({
      data: { userId: params.userId, type: params.type, title: params.title, message: params.message, actionUrl: params.actionUrl, metadata: params.metadata ? JSON.stringify(params.metadata) : undefined },
    });
  }

  async markRead(id: string, userId: string) {
    return this.prisma.notification.updateMany({ where: { id, userId }, data: { isRead: true } });
  }

  async markAllRead(userId: string) {
    const result = await this.prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } });
    return { updated: result.count };
  }

  async delete(id: string, userId: string) {
    await this.prisma.notification.deleteMany({ where: { id, userId } });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({ where: { userId, isRead: false } });
  }
}
