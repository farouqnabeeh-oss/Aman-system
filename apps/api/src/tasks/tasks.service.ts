import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { toIUserPublic } from '../common/utils/mapping-utils';
import type { TaskStatus, TaskPriority } from '@ems/shared';

const USER_SEL = { id: true, firstName: true, lastName: true, email: true, avatarUrl: true, role: true, department: true, position: true };

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditLogService) {}

  async findAll(filters: { projectId?: string; assigneeId?: string; status?: string; priority?: string; page: number; limit: number }) {
    const { projectId, assigneeId, status, priority, page, limit } = filters;
    const where = { deletedAt: null, ...(projectId ? { projectId } : {}), ...(assigneeId ? { assigneeId } : {}), ...(status ? { status } : {}), ...(priority ? { priority } : {}) };
    const [total, items] = await Promise.all([
      this.prisma.task.count({ where }),
      this.prisma.task.findMany({ where, include: { assignee: { select: USER_SEL }, reporter: { select: USER_SEL }, project: { select: { id: true, name: true } }, _count: { select: { comments: true } } }, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
    ]);
    return {
      items: items.map(({ _count, tags, estimatedHours, actualHours, ...t }) => ({
        ...t,
        status: t.status as TaskStatus,
        priority: t.priority as TaskPriority,
        tags: tags ? (JSON.parse(tags) as string[]) : [],
        estimatedHours: estimatedHours ? Number(estimatedHours) : null,
        actualHours: actualHours ? Number(actualHours) : null,
        commentsCount: _count.comments,
        dueDate: t.dueDate?.toISOString() ?? null,
        completedAt: t.completedAt?.toISOString() ?? null,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
        deletedAt: null,
        assignee: toIUserPublic(t.assignee),
        reporter: toIUserPublic(t.reporter),
      })),
      total,
    };
  }

  async findOne(id: string) {
    const t = await this.prisma.task.findUnique({ where: { id, deletedAt: null }, include: { assignee: { select: USER_SEL }, reporter: { select: USER_SEL }, project: { select: { id: true, name: true } }, comments: { include: { author: { select: USER_SEL } }, orderBy: { createdAt: 'asc' } } } });
    if (!t) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Task not found' });
    return {
      ...t,
      status: t.status as TaskStatus,
      priority: t.priority as TaskPriority,
      tags: t.tags ? (JSON.parse(t.tags) as string[]) : [],
      assignee: toIUserPublic(t.assignee),
      reporter: toIUserPublic(t.reporter),
      comments: t.comments.map((c) => ({ ...c, author: toIUserPublic(c.author) })),
    };
  }

  async create(dto: Record<string, unknown>, userId: string) {
    const task = await this.prisma.task.create({
      data: { title: dto['title'] as string, description: dto['description'] as string | undefined, priority: dto['priority'] as string ?? 'MEDIUM', projectId: dto['projectId'] as string, assigneeId: dto['assigneeId'] as string | undefined, reporterId: userId, dueDate: dto['dueDate'] ? new Date(dto['dueDate'] as string) : undefined, estimatedHours: dto['estimatedHours'] as number | undefined, tags: dto['tags'] ? JSON.stringify(dto['tags']) : undefined },
      include: { assignee: { select: USER_SEL }, reporter: { select: USER_SEL } },
    });
    await this.audit.log({ userId, action: 'CREATE', entity: 'tasks', entityId: task.id, newValues: { title: task.title } });
    return task;
  }

  async update(id: string, dto: Record<string, unknown>, userId: string, role: string) {
    const task = await this.prisma.task.findUnique({ where: { id, deletedAt: null } });
    if (!task) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Task not found' });
    const canEdit = task.assigneeId === userId || task.reporterId === userId || ['MANAGER', 'ADMIN', 'SUPER_ADMIN'].includes(role);
    if (!canEdit) throw new ForbiddenException({ code: 'FORBIDDEN', message: 'Cannot edit this task' });
    const data: Record<string, unknown> = { ...dto };
    if (dto['tags']) data['tags'] = JSON.stringify(dto['tags']);
    if (dto['dueDate']) data['dueDate'] = new Date(dto['dueDate'] as string);
    if (dto['status'] === 'DONE' && task.status !== 'DONE') data['completedAt'] = new Date();
    const updated = await this.prisma.task.update({ where: { id }, data: data as never, include: { assignee: { select: USER_SEL }, reporter: { select: USER_SEL } } });
    await this.audit.log({ userId, action: 'UPDATE', entity: 'tasks', entityId: id, newValues: { status: dto['status'] } });
    return updated;
  }

  async remove(id: string, userId: string) {
    await this.prisma.task.update({ where: { id }, data: { deletedAt: new Date() } });
    await this.audit.log({ userId, action: 'DELETE', entity: 'tasks', entityId: id });
  }

  async addComment(taskId: string, content: string, userId: string) {
    const comment = await this.prisma.taskComment.create({ data: { taskId, authorId: userId, content }, include: { author: { select: USER_SEL } } });
    return comment;
  }

  async getComments(taskId: string) {
    return this.prisma.taskComment.findMany({ where: { taskId }, include: { author: { select: USER_SEL } }, orderBy: { createdAt: 'asc' } });
  }
}
