'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from './auth';

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
    const leaves = await prisma.leaveRequest.findMany({
      include: {
        user: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const mapped = leaves.map((l) => ({
      ...l,
      userName: `${l.user.firstName} ${l.user.lastName}`,
    }));

    return { success: true, data: mapped };
  } catch (err) {
    return { success: false, message: 'Failed to fetch leave requests' };
  }
}

export async function getEmployeesForSecretary() {
  const session = await getSession();
  if (!session || !['SECRETARY', 'ADMIN', 'SUPER_ADMIN'].includes(session.role)) {
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
      attendance: u.attendanceRecords[0] || null,
    }));

    return { success: true, data: mapped };
  } catch (err) {
    return { success: false, message: 'Failed to fetch employees' };
  }
}

export async function markAttendance(userId: string, data: { status: string; checkIn?: string; checkOut?: string; notes?: string }) {
  const session = await getSession();
  if (!session || !['SECRETARY', 'ADMIN', 'SUPER_ADMIN'].includes(session.role)) {
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

    return { success: true, data: record };
  } catch (err) {
    console.error('Mark attendance error:', err);
    return { success: false, message: 'Failed to mark attendance' };
  }
}
