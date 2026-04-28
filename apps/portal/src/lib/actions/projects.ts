'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from './auth';
import { logAction } from '@/lib/audit';
import { revalidatePath } from 'next/cache';
import { CreateProjectSchema } from '@ems/shared';

export async function getProjects() {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
    const projects = await prisma.project.findMany({
      where: { deletedAt: null },
      include: {
        manager: { select: { firstName: true, lastName: true } },
        _count: { select: { tasks: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const mapped = projects.map((p) => ({
      ...p,
      managerName: `${p.manager.firstName} ${p.manager.lastName}`,
      tasksCount: p._count.tasks,
    }));

    return { success: true, data: mapped };
  } catch (err) {
    return { success: false, error: 'Failed to fetch projects' };
  }
}

export async function createProject(formData: any) {
  const session = await getSession();
  if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN' && session.role !== 'MANAGER')) {
    return { success: false, error: 'Unauthorized' };
  }

  const data = { ...formData };
  if (!data.clientId) delete data.clientId;
  if (!data.endDate) delete data.endDate;
  if (!data.budget) delete data.budget;

  const validated = CreateProjectSchema.safeParse(data);
  if (!validated.success) {
    return { success: false, error: validated.error.errors.map(e => e.message).join(', ') };
  }

  try {
    const project = await prisma.project.create({
      data: {
        ...validated.data,
        createdById: session.userId,
      },
    });
    await logAction({
      userId: session.userId,
      action: 'CREATE',
      entity: 'Project',
      entityId: project.id,
      newValues: project,
    });
    revalidatePath('/projects');
    revalidatePath('/dashboard');
    return { success: true, data: project };
  } catch (error) {
    return { success: false, error: 'Failed to create project' };
  }
}

export async function deleteProject(id: string) {
  const session = await getSession();
  if (!session || !['ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(session.role)) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    await prisma.project.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    await logAction({
      userId: session.userId,
      action: 'DELETE',
      entity: 'Project',
      entityId: id,
    });
    revalidatePath('/projects');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (err) {
    return { success: false, error: 'Failed to delete project' };
  }
}

export async function updateProject(id: string, data: any) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
    const updated = await prisma.project.update({
      where: { id },
      data,
    });
    await logAction({
      userId: session.userId,
      action: 'UPDATE',
      entity: 'Project',
      entityId: id,
      newValues: updated,
    });
    revalidatePath('/projects');
    revalidatePath('/dashboard');
    return { success: true, data: updated };
  } catch (err) {
    return { success: false, error: 'Failed to update project' };
  }
}
