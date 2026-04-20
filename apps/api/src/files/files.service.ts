import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { SupabaseService } from '../common/supabase/supabase.service';
import { toIUserPublic } from '../common/utils/mapping-utils';
import type { FileVisibility, Department } from '@ems/shared';

const USER_SEL = { id: true, firstName: true, lastName: true, email: true, avatarUrl: true, role: true, department: true, position: true };
const BUCKET = 'ems-files';

@Injectable()
export class FilesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditLogService,
    private readonly supabase: SupabaseService,
  ) {}

  async uploadFile(file: Express.Multer.File, userId: string, folderPath = '/', visibility = 'PRIVATE', department?: string) {
    const fileName = `${Date.now()}-${file.originalname}`;
    const storagePath = `uploads/${fileName}`;

    // 1. Upload to Supabase Storage
    await this.supabase.uploadFile(BUCKET, storagePath, file.buffer, file.mimetype);

    // 2. Get Public URL
    const publicUrl = await this.supabase.getPublicUrl(BUCKET, storagePath);

    // 3. Save to Database
    const record = await this.prisma.file.create({
      data: {
        name: fileName,
        originalName: file.originalname,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        storagePath,
        publicUrl,
        folderPath,
        visibility,
        department,
        uploadedById: userId,
      },
      include: { uploadedBy: { select: USER_SEL } },
    });

    await this.audit.log({
      userId,
      action: 'UPLOAD',
      entity: 'files',
      entityId: record.id,
      newValues: { name: file.originalname, size: file.size },
    });

    return this.serialize(record);
  }

  async findAll(filters: { folderPath?: string; visibility?: string; department?: string; search?: string; page: number; limit: number }) {
    const { folderPath, visibility, department, search, page, limit } = filters;
    const where = {
      deletedAt: null,
      ...(folderPath ? { folderPath } : {}),
      ...(visibility ? { visibility } : {}),
      ...(department ? { department } : {}),
      ...(search ? { OR: [{ name: { contains: search } }, { originalName: { contains: search } }] } : {}),
    };
    const [total, items] = await Promise.all([
      this.prisma.file.count({ where }),
      this.prisma.file.findMany({
        where,
        include: { uploadedBy: { select: USER_SEL } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);
    return { items: items.map(this.serialize), total };
  }

  async getFolders() {
    const files = await this.prisma.file.findMany({
      where: { deletedAt: null },
      select: { folderPath: true },
      distinct: ['folderPath'],
    });
    return [...new Set(files.map((f) => f.folderPath))].sort();
  }

  private serialize = (f: any) => ({
    ...f,
    visibility: f.visibility as FileVisibility,
    department: f.department as Department | null,
    createdAt: f.createdAt.toISOString(),
    deletedAt: f.deletedAt?.toISOString() ?? null,
    uploadedBy: toIUserPublic(f.uploadedBy),
  });

  async deleteFile(id: string, userId: string, role: string) {
    const file = await this.prisma.file.findUnique({ where: { id } });
    if (!file) throw new NotFoundException({ code: 'NOT_FOUND', message: 'File not found' });
    const canDelete = file.uploadedById === userId || ['ADMIN', 'SUPER_ADMIN'].includes(role);
    if (!canDelete) throw new NotFoundException({ code: 'FORBIDDEN', message: 'Cannot delete this file' });

    // 1. Remove from Supabase Storage
    try {
      await this.supabase.deleteFile(BUCKET, file.storagePath);
    } catch {
      /* ignore if already gone */
    }

    // 2. Mark as deleted in DB
    await this.prisma.file.update({ where: { id }, data: { deletedAt: new Date() } });
    await this.audit.log({ userId, action: 'DELETE', entity: 'files', entityId: id });
  }

  async updateFile(id: string, data: { name?: string; folderPath?: string; visibility?: string }, userId: string) {
    const updated = await this.prisma.file.update({ where: { id }, data, include: { uploadedBy: { select: USER_SEL } } });
    await this.audit.log({ userId, action: 'UPDATE', entity: 'files', entityId: id, newValues: data as Record<string, unknown> });
    return this.serialize(updated);
  }
}
