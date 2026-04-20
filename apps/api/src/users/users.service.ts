import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import type { IUser, IUserWithStats } from '@ems/shared';
import { UserRole, Department } from '@ems/shared';
import type { CreateUserDto, UpdateUserDto } from './dto/users.dto';
import type { UserFiltersDto } from './dto/users.dto';

const USER_SELECT = {
  id: true, email: true, role: true, status: true,
  firstName: true, lastName: true, avatarUrl: true, phone: true,
  department: true, position: true, emailVerified: true,
  lastLoginAt: true, createdById: true, createdAt: true, updatedAt: true, deletedAt: true,
} as const;

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) { }

  async findAll(filters: UserFiltersDto) {
    const { search, role, status, department, page, limit, sortBy, sortOrder } = filters;
    const where = {
      deletedAt: null,
      ...(search ? {
        OR: [
          { firstName: { contains: search } },
          { lastName: { contains: search } },
          { email: { contains: search } },
          { position: { contains: search } },
        ],
      } : {}),
      ...(role ? { role } : {}),
      ...(status ? { status } : {}),
      ...(department ? { department } : {}),
    };

    const [total, users] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        select: {
          ...USER_SELECT,
          _count: { select: { assignedTasks: true, managedProjects: true, leaveRequests: true } },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const items: IUserWithStats[] = users.map(({ _count, ...u }) => ({
      ...this.toIUser(u as Record<string, unknown>),
      tasksCount: _count.assignedTasks,
      projectsCount: _count.managedProjects,
      pendingLeaves: _count.leaveRequests,
    }));

    return { items, total };
  }

  async findOne(id: string): Promise<IUserWithStats> {
    const user = await this.prisma.user.findUnique({
      where: { id, deletedAt: null },
      select: {
        ...USER_SELECT,
        _count: { select: { assignedTasks: true, managedProjects: true, leaveRequests: true } },
      },
    });
    if (!user) throw new NotFoundException({ code: 'NOT_FOUND', message: 'User not found' });
    const { _count, ...u } = user;
    return {
      ...this.toIUser(u as Record<string, unknown>),
      tasksCount: _count.assignedTasks,
      projectsCount: _count.managedProjects,
      pendingLeaves: _count.leaveRequests,
    };
  }

  async create(dto: CreateUserDto, createdById: string): Promise<IUser> {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (existing) throw new ConflictException({ code: 'ALREADY_EXISTS', message: 'Email already in use' });

    const { password, ...restDto } = dto;
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await this.prisma.user.create({
      data: {
        ...restDto,
        email: dto.email.toLowerCase(),
        passwordHash,
        emailVerified: true,
        status: 'ACTIVE',
        createdById,
      },
      select: USER_SELECT,
    });

    await this.auditLog.log({
      userId: createdById,
      action: 'CREATE',
      entity: 'users',
      entityId: user.id,
      newValues: { email: user.email, role: user.role },
    });

    return this.toIUser(user);
  }

  async update(id: string, dto: UpdateUserDto, actorId: string, actorRole: string): Promise<IUser> {
    const user = await this.prisma.user.findUnique({ where: { id, deletedAt: null }, select: USER_SELECT });
    if (!user) throw new NotFoundException({ code: 'NOT_FOUND', message: 'User not found' });

    // Permissions check:
    // 1. Employees can only update THEMSELVES
    if (actorRole === 'EMPLOYEE' && actorId !== id) {
      throw new ForbiddenException({ code: 'FORBIDDEN', message: 'You can only update your own profile' });
    }

    // 2. Only Managers or higher can update others
    if (['MANAGER', 'ADMIN', 'SUPER_ADMIN'].includes(actorRole) === false && actorId !== id) {
      throw new ForbiddenException({ code: 'FORBIDDEN', message: 'Insufficient permissions to update this user' });
    }

    // 3. Restriction: Non-admins cannot change ROLE, STATUS, or DEPARTMENT (of others or self)
    // Only ADMIN/SUPER_ADMIN can change these critical fields
    if (!['ADMIN', 'SUPER_ADMIN'].includes(actorRole)) {
      if (dto.role && dto.role !== user.role) {
        throw new ForbiddenException({ code: 'FORBIDDEN', message: 'Only administrators can change account roles' });
      }
      if (dto.status && dto.status !== user.status) {
        throw new ForbiddenException({ code: 'FORBIDDEN', message: 'Only administrators can change account status' });
      }
      if (dto.department && dto.department !== user.department) {
        throw new ForbiddenException({ code: 'FORBIDDEN', message: 'Only administrators can change department assignment' });
      }
    }

    const { password, ...updateData } = dto;
    const dataToUpdate: any = { ...updateData, updatedById: actorId };

    if (password) {
      dataToUpdate.passwordHash = await bcrypt.hash(password, 12);
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: dataToUpdate,
      select: USER_SELECT,
    });

    await this.auditLog.log({
      userId: actorId, action: 'UPDATE', entity: 'users', entityId: id,
      oldValues: { role: user.role, status: user.status },
      newValues: dto as Record<string, unknown>,
    });

    return this.toIUser(updated);
  }

  async softDelete(id: string, actorId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id, deletedAt: null } });
    if (!user) throw new NotFoundException({ code: 'NOT_FOUND', message: 'User not found' });
    if (id === actorId) throw new ForbiddenException({ code: 'FORBIDDEN', message: 'Cannot delete yourself' });

    await this.prisma.user.update({ where: { id }, data: { deletedAt: new Date(), status: 'INACTIVE' } });
    await this.auditLog.log({ userId: actorId, action: 'DELETE', entity: 'users', entityId: id });
  }

  async bulkAction(ids: string[], action: 'activate' | 'deactivate' | 'delete', actorId: string): Promise<{ affected: number }> {
    const filtered = ids.filter((id) => id !== actorId);
    let count = 0;

    if (action === 'activate') {
      const result = await this.prisma.user.updateMany({ where: { id: { in: filtered }, deletedAt: null }, data: { status: 'ACTIVE' } });
      count = result.count;
    } else if (action === 'deactivate') {
      const result = await this.prisma.user.updateMany({ where: { id: { in: filtered }, deletedAt: null }, data: { status: 'INACTIVE' } });
      count = result.count;
    } else {
      const result = await this.prisma.user.updateMany({ where: { id: { in: filtered }, deletedAt: null }, data: { deletedAt: new Date(), status: 'INACTIVE' } });
      count = result.count;
    }

    await this.auditLog.log({ userId: actorId, action: action.toUpperCase(), entity: 'users', newValues: { ids: filtered, count } });
    return { affected: count };
  }

  async updateAvatar(id: string, avatarUrl: string): Promise<IUser> {
    const user = await this.prisma.user.update({ where: { id }, data: { avatarUrl }, select: USER_SELECT });
    return this.toIUser(user);
  }

  private toIUser(u: any): IUser {
    return {
      ...u,
      role: u.role as UserRole,
      department: u.department as Department | null,
      lastLoginAt: u.lastLoginAt ? (u.lastLoginAt as Date).toISOString() : null,
      createdAt: (u.createdAt as Date).toISOString(),
      updatedAt: (u.updatedAt as Date).toISOString(),
      deletedAt: u.deletedAt ? (u.deletedAt as Date).toISOString() : null,
    } as IUser;
  }
}
