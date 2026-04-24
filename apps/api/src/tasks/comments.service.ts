import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TaskCommentsService {
  constructor(private prisma: PrismaService) {}

  async create(taskId: string, authorId: string, content: string) {
    return this.prisma.taskComment.create({
      data: {
        taskId,
        authorId,
        content,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async findByTask(taskId: string) {
    return this.prisma.taskComment.findMany({
      where: { taskId },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async remove(id: string, authorId: string) {
    return this.prisma.taskComment.delete({
      where: { id, authorId },
    });
  }
}
