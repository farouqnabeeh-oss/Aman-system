import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { toIUserPublic } from '../common/utils/mapping-utils';
import type { ProjectStatus, Department } from '@ems/shared';

const USER_SEL = { id: true, firstName: true, lastName: true, email: true, avatarUrl: true, role: true, department: true, position: true };

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditLogService) {}

  async findAll(filters: { status?: string; department?: string; search?: string; page: number; limit: number }) {
    const { status, department, search, page, limit } = filters;
    const where = { deletedAt: null, ...(status ? { status } : {}), ...(department ? { department } : {}), ...(search ? { OR: [{ name: { contains: search } }, { description: { contains: search } }] } : {}) };
    const [total, items] = await Promise.all([
      this.prisma.project.count({ where }),
      this.prisma.project.findMany({ where, include: { manager: { select: USER_SEL }, client: true, _count: { select: { tasks: { where: { deletedAt: null } } } } }, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
    ]);
    return {
      items: items.map(({ _count, budget, manager, ...p }) => ({
        ...p,
        status: p.status as ProjectStatus,
        department: p.department as Department | null,
        budget: budget ? Number(budget) : null,
        tasksCount: _count.tasks,
        startDate: p.startDate.toISOString(),
        endDate: p.endDate?.toISOString() ?? null,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
        deletedAt: null,
        manager: toIUserPublic(manager),
      })),
      total,
    };
  }

  async findOne(id: string) {
    const p = await this.prisma.project.findUnique({ where: { id, deletedAt: null }, include: { manager: { select: USER_SEL }, client: true, tasks: { where: { deletedAt: null }, include: { assignee: { select: USER_SEL } }, orderBy: { createdAt: 'desc' } } } });
    if (!p) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Project not found' });
    return {
      ...p,
      status: p.status as ProjectStatus,
      department: p.department as Department | null,
      budget: p.budget ? Number(p.budget) : null,
      manager: toIUserPublic(p.manager),
      tasks: p.tasks.map((t) => ({ ...t, assignee: toIUserPublic(t.assignee) })),
    };
  }

  async create(dto: Record<string, unknown>, userId: string) {
    const p = await this.prisma.project.create({ data: { ...dto, startDate: new Date(dto['startDate'] as string), endDate: dto['endDate'] ? new Date(dto['endDate'] as string) : undefined, createdById: userId } as never, include: { manager: { select: USER_SEL } } });
    await this.audit.log({ userId, action: 'CREATE', entity: 'projects', entityId: p.id, newValues: { name: p.name } });
    return p;
  }

  async update(id: string, dto: Record<string, unknown>, userId: string, role: string) {
    const p = await this.prisma.project.findUnique({ where: { id, deletedAt: null } });
    if (!p) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Project not found' });
    if (p.managerId !== userId && !['ADMIN', 'SUPER_ADMIN'].includes(role)) throw new ForbiddenException({ code: 'FORBIDDEN', message: 'Not the project manager' });
    const updated = await this.prisma.project.update({ where: { id }, data: dto as never, include: { manager: { select: USER_SEL } } });
    await this.audit.log({ userId, action: 'UPDATE', entity: 'projects', entityId: id, newValues: dto as Record<string, unknown> });
    return updated;
  }

  async remove(id: string, userId: string) {
    await this.prisma.project.update({ where: { id }, data: { deletedAt: new Date() } });
    await this.audit.log({ userId, action: 'DELETE', entity: 'projects', entityId: id });
  }
}
