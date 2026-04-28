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

  const validated = CreateTaskSchema.safeParse(formData);
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
    const updated = await prisma.task.update({
      where: { id },
      data: {
        ...data,
        tags: data.tags?.join(',') || data.tags,
      },
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
    return { success: false, error: 'Failed to update task' };
  }
}
