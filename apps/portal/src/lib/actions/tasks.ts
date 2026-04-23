'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from './auth';
import { logAction } from '@/lib/audit';
import { CreateTaskSchema } from '@ems/shared';

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
    return { success: false, message: 'Failed to fetch tasks' };
  }
}

export async function createTask(formData: any) {
  const session = await getSession();
  if (!session) return { success: false, message: 'Unauthorized' };

  const validated = CreateTaskSchema.safeParse(formData);
  if (!validated.success) return { success: false, error: validated.error.flatten().fieldErrors };

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
    return { success: true, task };
  } catch (error) {
    return { success: false, message: 'Failed to create task' };
  }
}
