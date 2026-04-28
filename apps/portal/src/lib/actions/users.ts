'use server';

import { prisma } from '@/lib/prisma';
import { logAction } from '@/lib/audit';
import { z } from 'zod';
import * as bcrypt from 'bcrypt';
import { revalidatePath } from 'next/cache';
import { UserRole, UserStatus, Department } from '@ems/shared';
import { getSession } from '@/lib/actions/auth';

// --- SCHEMAS ---

const UserFiltersSchema = z.object({
  search: z.string().optional(),
  role: z.nativeEnum(UserRole).optional(),
  status: z.nativeEnum(UserStatus).optional(),
  department: z.string().optional(),
  page: z.number().default(1),
  limit: z.number().default(20),
  sortBy: z.enum(['firstName', 'lastName', 'email', 'employeeNumber', 'createdAt', 'role']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

const CreateUserSchema = z.object({
  email: z.string().email(),
  employeeNumber: z.string().optional(),
  nationalId: z.string().optional(),
  password: z.string().min(6).optional(), // Can be empty if using default password
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  role: z.nativeEnum(UserRole).default(UserRole.EMPLOYEE),
  department: z.string().nullable().optional(),
  position: z.string().max(100).nullable().optional(),
  phone: z.string().nullable().optional(),
});

const UpdateUserSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  employeeNumber: z.string().optional(),
  nationalId: z.string().optional(),
  role: z.nativeEnum(UserRole).optional(),
  status: z.nativeEnum(UserStatus).optional(),
  department: z.string().nullable().optional(),
  position: z.string().max(100).nullable().optional(),
  phone: z.string().nullable().optional(),
  password: z.string().min(6).optional(),
  avatarUrl: z.string().url().optional().nullable(),
});

// --- ACTIONS ---

export async function getUsers(filters: z.input<typeof UserFiltersSchema>) {
  try {
    const validated = UserFiltersSchema.parse(filters);
    const { search, role, status, department, page, limit, sortBy, sortOrder } = validated;
    
    const where: any = {
      deletedAt: null,
      ...(search ? {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { employeeNumber: { contains: search, mode: 'insensitive' } },
          { position: { contains: search, mode: 'insensitive' } },
        ],
      } : {}),
      ...(role ? { role } : {}),
      ...(status ? { status } : {}),
      ...(department ? { department } : {}),
    };

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        select: {
          id: true, email: true, employeeNumber: true, nationalId: true,
          role: true, status: true,
          firstName: true, lastName: true, avatarUrl: true, phone: true,
          department: true, position: true, emailVerified: true,
          lastLoginAt: true, createdAt: true, updatedAt: true,
          _count: {
            select: { assignedTasks: true, managedProjects: true, leaveRequests: true }
          }
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const items = users.map(({ _count, ...u }) => ({
      ...u,
      tasksCount: _count.assignedTasks,
      projectsCount: _count.managedProjects,
      pendingLeaves: _count.leaveRequests,
    }));

    return { success: true, data: { items, total } };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createUser(data: z.infer<typeof CreateUserSchema>) {
  try {
    const session = await getSession();
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.role)) {
      throw new Error('Unauthorized');
    }

    const validated = CreateUserSchema.safeParse(data);
    if (!validated.success) {
      return { success: false, error: validated.error.errors.map(e => e.message).join(', ') };
    }
    const val = validated.data;
    // --- Auto-generate Employee Number ---
    let finalEmployeeNumber = val.employeeNumber;
    if (!finalEmployeeNumber) {
        const lastUser = await prisma.user.findFirst({
            where: { deletedAt: null },
            orderBy: { createdAt: 'desc' },
            select: { employeeNumber: true }
        });
        
        let lastNum = 1000;
        if (lastUser?.employeeNumber) {
            const parsed = parseInt(lastUser.employeeNumber.replace(/\D/g, ''));
            if (!isNaN(parsed)) lastNum = parsed;
        }
        finalEmployeeNumber = `AMAN-${lastNum + 1}`;
    }

    const existing = await prisma.user.findFirst({ 
      where: { 
        OR: [
          { email: val.email.toLowerCase() },
          { employeeNumber: finalEmployeeNumber }
        ]
      } 
    });
    if (existing) throw new Error('Email or Employee Number already exists');

    const passwordToHash = val.password || val.nationalId || 'Aman2026!';
    const passwordHash = await bcrypt.hash(passwordToHash, 12);
    
    const user = await prisma.user.create({
      data: {
        ...val,
        employeeNumber: finalEmployeeNumber,
        email: val.email.toLowerCase(),
        passwordHash,
        emailVerified: true,
        status: 'ACTIVE',
        createdById: session.userId,
      },
    });

    await logAction({
      userId: session.userId,
      action: 'CREATE',
      entity: 'users',
      entityId: user.id,
      newValues: { email: user.email, role: user.role },
    });

    revalidatePath('/users');
    revalidatePath('/dashboard');
    return { success: true, data: user };
  } catch (error: any) {
    return { success: false, error: error.message || 'An unexpected error occurred' };
  }
}

export async function updateUser(id: string, data: any) {
  try {
    const session = await getSession();
    if (!session) throw new Error('Unauthorized');

    const validated = UpdateUserSchema.safeParse(data);
    if (!validated.success) {
      return { success: false, error: validated.error.errors.map(e => e.message).join(', ') };
    }
    const val = validated.data;

    const user = await prisma.user.findUnique({ where: { id, deletedAt: null } });
    if (!user) throw new Error('User not found');

    // Permissions check
    if (session.role === 'EMPLOYEE' && session.userId !== id) {
      throw new Error('Forbidden');
    }

    if (!['ADMIN', 'SUPER_ADMIN'].includes(session.role)) {
      if (val.role && val.role !== user.role) throw new Error('Only admins can change roles');
      if (val.status && val.status !== user.status) throw new Error('Only admins can change status');
      if (val.department && val.department !== user.department) throw new Error('Only admins can change department');
    }

    const { password, ...updateData } = val;
    const finalData: any = { ...updateData };

    if (password) {
      finalData.passwordHash = await bcrypt.hash(password, 12);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: finalData,
    });

    await logAction({
      userId: session.userId,
      action: 'UPDATE',
      entity: 'users',
      entityId: id,
      newValues: val as any,
    });

    revalidatePath('/users');
    revalidatePath('/dashboard');
    return { success: true, data: updated };
  } catch (error: any) {
    return { success: false, error: error.message || 'An unexpected error occurred' };
  }
}

export async function deleteUser(id: string) {
  try {
    const session = await getSession();
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.role)) {
      throw new Error('Unauthorized');
    }

    if (id === session.userId) throw new Error('Cannot delete self');

    await prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'INACTIVE' },
    });

    await logAction({
      userId: session.userId,
      action: 'DELETE',
      entity: 'users',
      entityId: id,
    });

    revalidatePath('/users');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
