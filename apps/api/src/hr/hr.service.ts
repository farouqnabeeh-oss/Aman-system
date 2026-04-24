import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { toIUserPublic } from '../common/utils/mapping-utils';
import type { LeaveType, LeaveStatus, AttendanceStatus } from '@ems/shared';

const USER_SEL = { id: true, firstName: true, lastName: true, email: true, avatarUrl: true, role: true, department: true, position: true };

@Injectable()
export class HrService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditLogService) {}

  // ── Leave Requests ──────────────────────────────────────────────────────
  async getLeaves(filters: { userId?: string; status?: string; page: number; limit: number }) {
    const { userId, status, page, limit } = filters;
    const where = { ...(userId ? { userId } : {}), ...(status ? { status } : {}) };
    const [total, items] = await Promise.all([
      this.prisma.leaveRequest.count({ where }),
      this.prisma.leaveRequest.findMany({ where, include: { user: { select: USER_SEL }, approvedBy: { select: USER_SEL } }, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
    ]);
    return { items: items.map(this.serializeLeave), total };
  }

  async createLeave(dto: { type: string; startDate: string; endDate: string; reason?: string }, userId: string) {
    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);
    const msPerDay = 86_400_000;
    const daysCount = Math.round((end.getTime() - start.getTime()) / msPerDay) + 1;

    // Check overlap
    const overlap = await this.prisma.leaveRequest.findFirst({
      where: { userId, status: { in: ['PENDING', 'APPROVED'] }, startDate: { lte: end }, endDate: { gte: start } },
    });
    if (overlap) throw new ConflictException({ code: 'LEAVE_OVERLAP', message: 'You already have a leave request overlapping these dates' });

    const leave = await this.prisma.leaveRequest.create({
      data: { userId, type: dto.type, startDate: start, endDate: end, daysCount, reason: dto.reason },
      include: { user: { select: USER_SEL } },
    });
    await this.audit.log({ userId, action: 'CREATE', entity: 'leave_requests', entityId: leave.id });
    return this.serializeLeave(leave);
  }

  async reviewLeave(id: string, status: 'APPROVED' | 'REJECTED', approvedById: string, rejectionReason?: string) {
    const leave = await this.prisma.leaveRequest.findUnique({ where: { id } });
    if (!leave) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Leave request not found' });
    if (leave.status !== 'PENDING') throw new BadRequestException({ code: 'CONFLICT', message: 'Can only review pending requests' });

    const updated = await this.prisma.leaveRequest.update({
      where: { id },
      data: { status, approvedById, approvedAt: new Date(), rejectionReason },
      include: { user: { select: USER_SEL }, approvedBy: { select: USER_SEL } },
    });
    await this.audit.log({ userId: approvedById, action: 'UPDATE', entity: 'leave_requests', entityId: id, newValues: { status } });
    return this.serializeLeave(updated);
  }

  // ── Attendance ──────────────────────────────────────────────────────────
  async getAttendance(filters: { userId?: string; dateFrom?: string; dateTo?: string; page: number; limit: number }) {
    const { userId, dateFrom, dateTo, page, limit } = filters;
    const where = {
      ...(userId ? { userId } : {}),
      ...(dateFrom || dateTo ? { date: { ...(dateFrom ? { gte: new Date(dateFrom) } : {}), ...(dateTo ? { lte: new Date(dateTo) } : {}) } } : {}),
    };
    const [total, items] = await Promise.all([
      this.prisma.attendanceRecord.count({ where }),
      this.prisma.attendanceRecord.findMany({ where, include: { user: { select: USER_SEL } }, orderBy: { date: 'desc' }, skip: (page - 1) * limit, take: limit }),
    ]);
    return { items: items.map((a) => ({ ...a, status: a.status as AttendanceStatus, user: toIUserPublic(a.user), date: a.date.toISOString(), checkIn: a.checkIn?.toISOString() ?? null, checkOut: a.checkOut?.toISOString() ?? null, createdAt: a.createdAt.toISOString(), updatedAt: a.updatedAt.toISOString() })), total };
  }

  async checkIn(userId: string) {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const normalizedDate = new Date(`${dateStr}T00:00:00.000Z`);

    const existing = await this.prisma.attendanceRecord.findUnique({ 
      where: { userId_date: { userId, date: normalizedDate } } 
    });
    
    if (existing?.checkIn) {
      throw new ConflictException({ code: 'CONFLICT', message: 'Already checked in today' });
    }

    const record = await this.prisma.attendanceRecord.upsert({
      where: { userId_date: { userId, date: normalizedDate } },
      create: { userId, date: normalizedDate, status: 'PRESENT', checkIn: now },
      update: { checkIn: now, status: 'PRESENT' },
    });
    
    await this.audit.log({ userId, action: 'CHECK_IN', entity: 'attendance', entityId: record.id });
    return record;
  }

  async checkOut(userId: string) {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const normalizedDate = new Date(`${dateStr}T00:00:00.000Z`);

    const record = await this.prisma.attendanceRecord.findUnique({ 
      where: { userId_date: { userId, date: normalizedDate } } 
    });

    if (!record?.checkIn) {
      throw new BadRequestException({ code: 'CONFLICT', message: 'Must check in before checking out' });
    }

    const updated = await this.prisma.attendanceRecord.update({ 
      where: { id: record.id }, 
      data: { checkOut: now } 
    });
    
    await this.audit.log({ userId, action: 'CHECK_OUT', entity: 'attendance', entityId: updated.id });
    return updated;
  }

  private serializeLeave = (l: any) => ({
    ...l,
    type: l.type as LeaveType,
    status: l.status as LeaveStatus,
    daysCount: Number(l['daysCount']),
    startDate: (l['startDate'] as Date).toISOString(),
    endDate: (l['endDate'] as Date).toISOString(),
    approvedAt: l['approvedAt'] ? (l['approvedAt'] as Date).toISOString() : null,
    createdAt: (l['createdAt'] as Date).toISOString(),
    updatedAt: (l['updatedAt'] as Date).toISOString(),
    user: toIUserPublic(l.user),
    approvedBy: toIUserPublic(l.approvedBy),
  });
}
