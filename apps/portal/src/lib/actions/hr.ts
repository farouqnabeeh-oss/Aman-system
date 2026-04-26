'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from './auth';
import { logAction } from '@/lib/audit';
import { revalidatePath } from 'next/cache';

// Helper to create a notification for a user
async function createNotification(userId: string, type: string, title: string, message: string, actionUrl?: string) {
  try {
    await prisma.notification.create({
      data: { userId, type, title, message, actionUrl },
    });
  } catch (e) {
    console.error('Notification creation failed:', e);
  }
}

export async function getAttendanceToday() {
  const session = await getSession();
  if (!session) return { success: false, message: 'Unauthorized' };

  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const attendances = await prisma.attendanceRecord.findMany({
      where: { date: { gte: startOfDay } },
      include: {
        user: { select: { firstName: true, lastName: true, department: true } },
      },
    });

    const mapped = attendances.map((a) => ({
      ...a,
      userName: `${a.user.firstName} ${a.user.lastName}`,
      department: a.user.department,
    }));

    return { success: true, data: mapped };
  } catch (err) {
    return { success: false, message: 'Failed to fetch attendance' };
  }
}

export async function getLeaveRequests() {
  const session = await getSession();
  if (!session) return { success: false, message: 'Unauthorized' };

  try {
    // If EMPLOYEE - show only their own; managers see all
    const isManager = ['ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(session.role);
    const where = isManager ? {} : { userId: session.userId };

    const leaves = await prisma.leaveRequest.findMany({
      where,
      include: {
        user: { select: { firstName: true, lastName: true, department: true } },
        approvedBy: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const mapped = leaves.map((l) => ({
      ...l,
      userName: `${l.user.firstName} ${l.user.lastName}`,
      department: l.user.department,
      approvedByName: l.approvedBy ? `${l.approvedBy.firstName} ${l.approvedBy.lastName}` : null,
    }));

    return { success: true, data: mapped };
  } catch (err) {
    return { success: false, message: 'Failed to fetch leave requests' };
  }
}

export async function getEmployeesForSecretary() {
  const session = await getSession();
  if (!session || !['SECRETARY', 'ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(session.role)) {
    return { success: false, message: 'Unauthorized' };
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const users = await prisma.user.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        employeeNumber: true,
        department: true,
        position: true,
        attendanceRecords: {
          where: { date: { gte: today } },
          take: 1,
        },
      },
      orderBy: { firstName: 'asc' },
    });

    const mapped = users.map((u) => ({
      id: u.id,
      name: `${u.firstName} ${u.lastName}`,
      employeeNumber: u.employeeNumber,
      department: u.department,
      position: u.position,
      attendance: u.attendanceRecords[0] || null,
    }));

    return { success: true, data: mapped };
  } catch (err) {
    return { success: false, message: 'Failed to fetch employees' };
  }
}

export async function markAttendance(userId: string, data: { status: string; checkIn?: string; checkOut?: string; notes?: string }) {
  const session = await getSession();
  if (!session || !['SECRETARY', 'ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(session.role)) {
    return { success: false, message: 'Unauthorized' };
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const record = await prisma.attendanceRecord.upsert({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
      update: {
        status: data.status,
        checkIn: data.checkIn ? new Date(data.checkIn) : undefined,
        checkOut: data.checkOut ? new Date(data.checkOut) : undefined,
        notes: data.notes,
      },
      create: {
        userId,
        date: today,
        status: data.status,
        checkIn: data.checkIn ? new Date(data.checkIn) : undefined,
        checkOut: data.checkOut ? new Date(data.checkOut) : undefined,
        notes: data.notes,
      },
    });

    await logAction({
      userId: session.userId,
      action: 'UPDATE',
      entity: 'AttendanceRecord',
      entityId: record.id,
      newValues: { status: data.status, userId },
    });

    revalidatePath('/secretary');
    return { success: true, data: record };
  } catch (err) {
    console.error('Mark attendance error:', err);
    return { success: false, message: 'Failed to mark attendance' };
  }
}

export async function requestLeave(data: { type: string; startDate: string; endDate: string; reason?: string; daysCount: number }) {
  const session = await getSession();
  if (!session) return { success: false, message: 'Unauthorized' };

  try {
    // Validate dates
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return { success: false, message: 'Invalid dates provided' };
    }
    if (end < start) {
      return { success: false, message: 'End date must be after start date' };
    }

    const leave = await prisma.leaveRequest.create({
      data: {
        userId: session.userId,
        type: data.type,
        startDate: start,
        endDate: end,
        daysCount: data.daysCount,
        reason: data.reason,
        status: 'PENDING',
      },
    });

    // Notify all managers
    const managers = await prisma.user.findMany({
      where: { role: { in: ['ADMIN', 'SUPER_ADMIN', 'MANAGER'] }, deletedAt: null },
      select: { id: true },
    });

    const requester = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { firstName: true, lastName: true },
    });

    await Promise.all(
      managers.map((m) =>
        createNotification(
          m.id,
          'WARNING',
          'طلب إجازة جديد',
          `${requester?.firstName} ${requester?.lastName} طلب إجازة من ${start.toLocaleDateString('ar-SA')} (${data.daysCount} يوم)`,
          '/hr'
        )
      )
    );

    await logAction({
      userId: session.userId,
      action: 'CREATE',
      entity: 'LeaveRequest',
      entityId: leave.id,
      newValues: { type: data.type, daysCount: data.daysCount },
    });

    revalidatePath('/hr');
    return { success: true, data: leave };
  } catch (err) {
    console.error('Leave request error:', err);
    return { success: false, message: 'Failed to request leave' };
  }
}

export async function updateLeaveStatus(id: string, status: string, reason?: string) {
  const session = await getSession();
  if (!session || !['ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(session.role)) {
    return { success: false, message: 'Unauthorized' };
  }

  try {
    const leave = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status,
        rejectionReason: reason,
        approvedById: session.userId,
        approvedAt: new Date(),
      },
      include: { user: { select: { id: true, firstName: true, lastName: true } } },
    });

    // Notify the employee of the decision
    const isApproved = status === 'APPROVED';
    await createNotification(
      leave.user.id,
      isApproved ? 'INFO' : 'ALERT',
      isApproved ? '✅ تمت الموافقة على طلب الإجازة' : '❌ تم رفض طلب الإجازة',
      isApproved
        ? 'تمت الموافقة على طلب إجازتك. نتمنى لك وقتاً ممتعاً!'
        : `تم رفض طلب إجازتك.${reason ? ' السبب: ' + reason : ''}`,
      '/hr'
    );

    await logAction({
      userId: session.userId,
      action: 'UPDATE',
      entity: 'LeaveRequest',
      entityId: id,
      newValues: { status },
    });

    revalidatePath('/hr');
    return { success: true, data: leave };
  } catch (err) {
    return { success: false, message: 'Failed to update leave status' };
  }
}

export async function selfAttendance(action: 'IN' | 'OUT') {
  const session = await getSession();
  if (!session) return { success: false, message: 'Unauthorized' };

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const now = new Date();

    if (action === 'IN') {
      await prisma.attendanceRecord.upsert({
        where: { userId_date: { userId: session.userId, date: today } },
        update: { checkIn: now, status: 'PRESENT' },
        create: { userId: session.userId, date: today, checkIn: now, status: 'PRESENT' },
      });
    } else {
      const existing = await prisma.attendanceRecord.findUnique({
        where: { userId_date: { userId: session.userId, date: today } },
      });
      if (!existing) {
        return { success: false, message: 'No check-in record found for today. Please check in first.' };
      }
      await prisma.attendanceRecord.update({
        where: { userId_date: { userId: session.userId, date: today } },
        data: { checkOut: now },
      });
    }

    await logAction({
      userId: session.userId,
      action: 'UPDATE',
      entity: 'AttendanceRecord',
      newValues: { action, time: now.toISOString() },
    });

    revalidatePath('/hr');
    return { success: true };
  } catch (err) {
    console.error('Self attendance error:', err);
    return { success: false, message: 'Attendance operation failed' };
  }
}
