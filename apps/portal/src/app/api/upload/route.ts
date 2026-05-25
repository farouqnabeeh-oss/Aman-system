import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/actions/auth';

export const runtime = 'nodejs';

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

    const timestamp = Date.now();
    const safeOriginal = file.name.replace(/[^a-zA-Z0-9._\-]/g, '_');
    const fileName = `${timestamp}-${safeOriginal}`;
    const storagePath = `uploads/${fileName}`;

    // Get Supabase credentials from environment variables
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL or Key is missing in environment variables');
    }

    // Upload directly to Supabase Storage bucket 'ems-files' via REST API
    const bucket = 'ems-files';
    const uploadUrl = `${supabaseUrl}/storage/v1/object/${bucket}/${storagePath}`;

    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': file.type || 'application/octet-stream',
        'x-upsert': 'true',
      },
      body: buffer,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Supabase upload failed: ${response.statusText} (${response.status}) - ${errorText}`);
    }

    // Construct the public URL for Supabase storage
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${storagePath}`;

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
    console.error('[upload] Error:', err);
    return NextResponse.json({ success: false, message: `Upload failed: ${err.message || 'Unknown'}` }, { status: 500 });
  }
}
