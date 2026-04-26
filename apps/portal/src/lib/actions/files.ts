'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from './auth';
import { revalidatePath } from 'next/cache';

export async function getFiles() {
  const session = await getSession();
  if (!session) return { success: false, message: 'Unauthorized' };

  try {
    const files = await prisma.file.findMany({
      where: { deletedAt: null },
      include: {
        uploadedBy: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: files };
  } catch (err) {
    return { success: false, message: 'Failed to fetch files' };
  }
}

export async function deleteFile(id: string) {
  const session = await getSession();
  if (!session) return { success: false, message: 'Unauthorized' };

  try {
    await prisma.file.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    revalidatePath('/files');
    return { success: true };
  } catch (err) {
    return { success: false, message: 'Failed to delete file' };
  }
}

export async function uploadFileMetadata(data: {
  name: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  storagePath: string;
  publicUrl?: string;
  department?: string;
  entityType?: string;
  entityId?: string;
}) {
  const session = await getSession();
  if (!session) return { success: false, message: 'Unauthorized' };

  try {
    const file = await prisma.file.create({
      data: {
        ...data,
        uploadedById: session.userId,
      },
    });
    revalidatePath('/files');
    return { success: true, data: file };
  } catch (err) {
    return { success: false, message: 'Failed to save file metadata' };
  }
}
