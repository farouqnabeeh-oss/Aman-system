import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { getSession } from '@/lib/actions/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs'; // must be nodejs for fs access

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads');

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const folderPath = (formData.get('folderPath') as string) || '/';
    const visibility = (formData.get('visibility') as string) || 'PRIVATE';
    const entityType = formData.get('entityType') as string | null;
    const entityId = formData.get('entityId') as string | null;

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure uploads directory exists
    await mkdir(UPLOAD_DIR, { recursive: true });

    const timestamp = Date.now();
    const safeOriginal = file.name.replace(/[^a-zA-Z0-9._\-]/g, '_');
    const fileName = `${timestamp}-${safeOriginal}`;
    const filePath = join(UPLOAD_DIR, fileName);

    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${fileName}`;
    const storagePath = `uploads/${fileName}`;

    // Persist metadata in DB
    const record = await prisma.file.create({
      data: {
        name: file.name,
        originalName: file.name,
        mimeType: file.type || 'application/octet-stream',
        sizeBytes: file.size,
        storagePath,
        publicUrl,
        folderPath,
        visibility,
        entityType: entityType || null,
        entityId: entityId || null,
        uploadedById: session.userId,
      },
      include: {
        uploadedBy: { select: { firstName: true, lastName: true } },
      },
    });

    return NextResponse.json({ success: true, data: record });
  } catch (err: any) {
    // Write error to logs.txt
    try {
      const fs = require('fs');
      fs.appendFileSync(join(process.cwd(), 'logs.txt'), `[Upload Error] ${new Date().toISOString()}: ${err.stack || err}\n`);
    } catch (logErr) {}
    console.error('[upload] Error:', err);
    return NextResponse.json({ success: false, message: `Upload failed: ${err.message || 'Unknown'}` }, { status: 500 });
  }
}
