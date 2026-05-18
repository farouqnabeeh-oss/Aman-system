'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from './auth';
import { logAction } from '@/lib/audit';
import { CreateTaskSchema } from '@ems/shared';
import { revalidatePath } from 'next/cache';

export async function getTasks() {
  const session = await getSession();
  if (!session) return { success: false, message: 'Unauthorized' };

  try {
    const tasks = await prisma.task.findMany({
      where: { deletedAt: null },
      include: {
        assignee: { select: { firstName: true, lastName: true } },
        project: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const mapped = tasks.map((t) => ({
      ...t,
      assigneeName: t.assignee ? `${t.assignee.firstName} ${t.assignee.lastName}` : 'Unassigned',
      projectName: t.project.name,
    }));

    return { success: true, data: mapped };
  } catch (err) {
    return { success: false, error: 'Failed to fetch tasks' };
  }
}

export async function createTask(formData: any) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };

  const data = { ...formData };
  if (!data.assigneeId) delete data.assigneeId;
  if (!data.dueDate) delete data.dueDate;

  const validated = CreateTaskSchema.safeParse(data);
  if (!validated.success) {
    return { success: false, error: validated.error.errors.map(e => e.message).join(', ') };
  }

  try {
    const task = await prisma.task.create({
      data: {
        ...validated.data,
        tags: validated.data.tags?.join(',') || null,
        reporterId: session.userId,
      },
    });
    await logAction({
      userId: session.userId,
      action: 'CREATE',
      entity: 'Task',
      entityId: task.id,
      newValues: task,
    });
    revalidatePath('/tasks');
    revalidatePath('/dashboard');
    return { success: true, data: task };
  } catch (error) {
    return { success: false, error: 'Failed to create task' };
  }
}

export async function deleteTask(id: string) {
  const session = await getSession();
  if (!session || !['ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(session.role)) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    await prisma.task.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    revalidatePath('/tasks');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (err) {
    return { success: false, error: 'Failed to delete task' };
  }
}

export async function updateTask(id: string, data: any) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) return { success: false, error: 'Task not found' };

    const isReporterOrManager = session.userId === task.reporterId || ['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(session.role);

    // Strip UI-only helper fields that don't exist in the DB schema
    const UI_ONLY_FIELDS = [
      'assigneeName', 'projectName', 'assignee', 'project',
      'reporter', 'id', 'createdAt', 'updatedAt', 'deletedAt', 'reporterId',
    ];

    let updateData: Record<string, any> = {};
    for (const [key, val] of Object.entries(data)) {
      if (UI_ONLY_FIELDS.includes(key)) continue;
      // Convert empty-string relation ID to undefined so Prisma ignores it
      if (key === 'assigneeId' && typeof val === 'string' && val.trim() === '') {
        updateData[key] = null;
        continue;
      }
      updateData[key] = val;
    }

    // Handle tags serialization
    if (Array.isArray(updateData.tags)) {
      updateData.tags = updateData.tags.join(',');
    }

    if (!isReporterOrManager) {
      if (!data.status) {
        return { success: false, error: 'Employees can only update task status' };
      }
      updateData = { status: data.status };
    }

    const updated = await prisma.task.update({
      where: { id },
      data: updateData,
    });
    await logAction({
      userId: session.userId,
      action: 'UPDATE',
      entity: 'Task',
      entityId: id,
      newValues: updated,
    });
    revalidatePath('/tasks');
    revalidatePath('/dashboard');
    return { success: true, data: updated };
  } catch (err) {
    console.error('[updateTask]', err);
    return { success: false, error: 'Failed to update task' };
  }
}

