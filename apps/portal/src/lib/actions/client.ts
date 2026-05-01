'use server';

import { prisma } from '@/lib/prisma';

export async function getClientPortalData(portalAccessKey: string) {
    if (!portalAccessKey) return { success: false, message: 'Invalid Key' };

    try {
        const client = await prisma.client.findUnique({
            where: { portalAccessKey },
            include: {
                smDetails: true,
                brandGuideline: true,
                projects: {
                    where: { deletedAt: null },
                    include: {
                        tasks: {
                            where: { deletedAt: null },
                            orderBy: { createdAt: 'desc' },
                            take: 10
                        }
                    }
                }
            }
        });

        if (!client) return { success: false, message: 'Client not found' };

        const stats = {
            doneDesigns: client.smDetails?.doneDesigns || 0,
            doneVideos: client.smDetails?.doneVideos || 0,
            targetDesigns: client.smDetails?.targetDesigns || 0,
            targetVideos: client.smDetails?.targetVideos || 0,
        };

        const activeTasks = client.projects.flatMap(p => p.tasks);

        return {
            success: true,
            data: {
                client: {
                    id: client.id,
                    name: client.name,
                    smDetails: client.smDetails
                },
                stats,
                activeTasks,
                guideline: client.brandGuideline
            }
        };
    } catch (err) {
        return { success: false, message: 'Server Error' };
    }
}

export async function updateBrandGuideline(clientId: string, data: any) {
    try {
        const guideline = await prisma.brandGuideline.upsert({
            where: { clientId },
            update: data,
            create: {
                clientId,
                ...data
            }
        });
        return { success: true, data: guideline };
    } catch (err) {
        return { success: false, message: 'Failed to update assets' };
    }
}
