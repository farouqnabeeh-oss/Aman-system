'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from './auth';
import { logAction } from '@/lib/audit';
import { revalidatePath } from 'next/cache';
import { CreateProjectSchema } from '@ems/shared';

export async function getProjects() {
  const session = await getSession();
  if (!session) return { success: false, message: 'Unauthorized' };

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
    return { success: false, message: 'Failed to fetch projects' };
  }
}

export async function createProject(formData: any) {
  const session = await getSession();
  if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN' && session.role !== 'MANAGER')) {
    return { success: false, message: 'Unauthorized' };
  }

  const validated = CreateProjectSchema.safeParse(formData);
  if (!validated.success) return { success: false, error: validated.error.flatten().fieldErrors };

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
    return { success: true, project };
  } catch (error) {
    return { success: false, message: 'Failed to create project' };
  }
}

export async function deleteProject(id: string) {
  const session = await getSession();
  if (!session || !['ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(session.role)) {
    return { success: false, message: 'Unauthorized' };
  }

  try {
    await prisma.project.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    revalidatePath('/projects');
    return { success: true };
  } catch (err) {
    return { success: false, message: 'Failed to delete project' };
  }
}

export async function updateProject(id: string, data: any) {
  const session = await getSession();
  if (!session) return { success: false, message: 'Unauthorized' };

  try {
    const updated = await prisma.project.update({
      where: { id },
      data,
    });
    revalidatePath('/projects');
    return { success: true, data: updated };
  } catch (err) {
    return { success: false, message: 'Failed to update project' };
  }
}
