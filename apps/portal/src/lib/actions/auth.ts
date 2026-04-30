'use server';

import { cookies } from 'next/headers';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import prisma from '@/lib/prisma';
import { signAccessToken, signRefreshToken } from '@/lib/auth';
import { RegisterSchema, LoginSchema } from '@ems/shared';

const BCRYPT_ROUNDS = 12;

export async function register(formData: any) {
  const validated = RegisterSchema.safeParse(formData);
  if (!validated.success) {
    return { success: false, error: validated.error.flatten().fieldErrors };
  }

  const { email, password, firstName, lastName } = validated.data;

  try {
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return { success: false, message: 'Email already registered' };
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const emailVerifyToken = uuidv4();

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        firstName,
        lastName,
        role: 'EMPLOYEE',
        status: 'PENDING',
        emailVerifyToken,
      },
    });

    const accessToken = await signAccessToken({ sub: user.id, role: user.role as any });
    const refreshToken = await signRefreshToken(user.id);
    const hashedRefreshToken = await bcrypt.hash(refreshToken, BCRYPT_ROUNDS);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashedRefreshToken },
    });

    const cookieStore = await cookies();
    cookieStore.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return { success: true, accessToken };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, message: 'An unexpected error occurred' };
  }
}

export async function login(formData: any) {
  const validated = LoginSchema.safeParse(formData);
  if (!validated.success) {
    return { success: false, error: validated.error.flatten().fieldErrors };
  }

  const employeeNumber = validated.data.employeeNumber.trim();
  const password = validated.data.password.trim();
  const isRtl = true; // Defaulting for message purposes or fetch from context if possible

  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { employeeNumber: { equals: employeeNumber, mode: 'insensitive' } },
          { email: employeeNumber.toLowerCase() }
        ],
        deletedAt: null 
      },
    });

    if (!user) {
      return { success: false, message: 'Invalid credentials' };
    }

    // Check if password matches passwordHash OR matches nationalId (default password)
    const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash);
    const isDefaultPassword = user.nationalId === password;

    if (!isPasswordCorrect && !isDefaultPassword) {
      return { success: false, message: 'Invalid employee number or password' };
    }

    if (user.status === 'SUSPENDED') {
      return { success: false, message: 'Account is suspended' };
    }

    const accessToken = await signAccessToken({ sub: user.id, role: user.role as any });
    const refreshToken = await signRefreshToken(user.id);
    const hashedRefreshToken = await bcrypt.hash(refreshToken, BCRYPT_ROUNDS);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        refreshToken: hashedRefreshToken,
        lastLoginAt: new Date(),
        status: user.status === 'PENDING' ? 'ACTIVE' : user.status,
      },
    });

    const cookieStore = await cookies();
    cookieStore.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return { 
      success: true, 
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
      }
    };
  } catch (error: any) {
    console.error('Login error:', error);
    return { success: false, message: `Debug Error: ${error.message || 'Unknown'}` };
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('refresh_token');
  return { success: true };
}

export async function getSession(): Promise<{ userId: string; role: string } | null> {
  try {
    const cookieStore = await cookies();
    const refreshCookie = cookieStore.get('refresh_token');
    if (!refreshCookie?.value) return null;

    const { verifyRefreshToken } = await import('@/lib/auth');
    const payload = await verifyRefreshToken(refreshCookie.value);
    if (!payload?.sub) return null;

    const user = await prisma.user.findUnique({
      where: { id: payload.sub, deletedAt: null },
      select: { id: true, role: true, status: true },
    });

    if (!user || user.status === 'SUSPENDED') return null;

    return { userId: user.id, role: user.role };
  } catch {
    return null;
  }
}
