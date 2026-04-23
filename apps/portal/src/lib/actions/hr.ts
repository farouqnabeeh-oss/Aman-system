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
