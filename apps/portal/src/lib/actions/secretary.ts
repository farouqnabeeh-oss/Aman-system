'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from './auth';
import { revalidatePath } from 'next/cache';

// --- Visitor Logs ---

export async function getVisitors() {
    try {
        const visitors = await prisma.visitorLog.findMany({
            include: { host: { select: { firstName: true, lastName: true } } },
            orderBy: { checkIn: 'desc' },
            take: 50
        });
        return { success: true, data: visitors };
    } catch {
        return { success: false, data: [] };
    }
}

export async function addVisitor(data: { name: string; phone?: string; purpose: string; hostId?: string }) {
    const session = await getSession();
    if (!session) return { success: false, message: 'Unauthorized' };

    try {
        const visitor = await prisma.visitorLog.create({
            data: { ...data, status: 'IN' }
        });
        revalidatePath('/secretary');
        return { success: true, data: visitor };
    } catch {
        return { success: false, message: 'Failed to add visitor' };
    }
}

export async function checkOutVisitor(id: string) {
    try {
        await prisma.visitorLog.update({
            where: { id },
            data: { checkOut: new Date(), status: 'OUT' }
        });
        revalidatePath('/secretary');
        return { success: true };
    } catch {
        return { success: false };
    }
}

// --- Inventory Management ---

export async function getInventory() {
    try {
        const items = await prisma.inventoryItem.findMany({
            orderBy: { name: 'asc' }
        });
        return { success: true, data: items };
    } catch {
        return { success: false, data: [] };
    }
}

export async function updateInventoryQuantity(id: string, quantity: number) {
    try {
        const item = await prisma.inventoryItem.update({
            where: { id },
            data: { 
                quantity,
                status: quantity === 0 ? 'OUT_OF_STOCK' : quantity <= 5 ? 'LOW' : 'AVAILABLE'
            }
        });
        revalidatePath('/secretary');
        return { success: true, data: item };
    } catch {
        return { success: false };
    }
}

export async function addInventoryItem(data: { name: string; category: string; quantity: number; minQuantity: number; unit: string }) {
    try {
        const item = await prisma.inventoryItem.create({
            data: {
                ...data,
                status: data.quantity === 0 ? 'OUT_OF_STOCK' : data.quantity <= data.minQuantity ? 'LOW' : 'AVAILABLE'
            }
        });
        revalidatePath('/secretary');
        return { success: true, data: item };
    } catch {
        return { success: false };
    }
}

// --- Petty Cash (العهدة النثرية) ---

export async function getPettyCash() {
    try {
        const records = await prisma.pettyCash.findMany({
            orderBy: { date: 'desc' },
            take: 100
        });
        return { success: true, data: records };
    } catch {
        return { success: false, data: [] };
    }
}

export async function requestPettyCash(data: { amount: number; reason: string }) {
    const session = await getSession();
    if (!session) return { success: false, message: 'Unauthorized' };

    try {
        const record = await prisma.pettyCash.create({
            data: {
                amount: data.amount,
                reason: data.reason,
                requestedBy: session.userId,
                status: 'PENDING'
            }
        });
        revalidatePath('/secretary');
        return { success: true, data: record };
    } catch {
        return { success: false };
    }
}

export async function approvePettyCash(id: string, status: 'APPROVED' | 'REJECTED') {
    const session = await getSession();
    if (!session || !['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(session.role)) {
        return { success: false, message: 'Unauthorized' };
    }

    try {
        await prisma.pettyCash.update({
            where: { id },
            data: { status, approvedBy: session.userId }
        });
        revalidatePath('/secretary');
        return { success: true };
    } catch {
        return { success: false };
    }
}
