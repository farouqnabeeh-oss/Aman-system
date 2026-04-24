import { Controller, Get, Post, Patch, Delete, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { RequestUser } from '../common/decorators/current-user.decorator';



@UseGuards(RolesGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async findAll(@CurrentUser() user: RequestUser, @Query('unread') unread?: string) {
    const data = await this.notificationsService.findAll(user.id, unread === 'true');
    return { success: true, data };
  }

  @Get('unread-count')
  async getUnreadCount(@CurrentUser() user: RequestUser) {
    const count = await this.notificationsService.getUnreadCount(user.id);
    return { success: true, data: { count } };
  }

  @Patch(':id/read') @HttpCode(HttpStatus.OK)
  async markRead(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    await this.notificationsService.markRead(id, user.id);
    return { success: true, data: null };
  }

  @Post('read-all') @HttpCode(HttpStatus.OK)
  async markAllRead(@CurrentUser() user: RequestUser) {
    const data = await this.notificationsService.markAllRead(user.id);
    return { success: true, data };
  }

  @Post('broadcast')
  async broadcast(@CurrentUser() user: RequestUser, @Query('userId') userId?: string, @Query('title') title?: string, @Query('message') message?: string) {
    if (userId) {
      await this.notificationsService.create({ userId, title: title || 'System Alert', message: message || '', type: 'SYSTEM' });
    } else {
      const users = await (this.notificationsService as any).prisma.user.findMany({ where: { deletedAt: null } });
      for (const u of users) {
        await this.notificationsService.create({ userId: u.id, title: title || 'Broadcast', message: message || '', type: 'SYSTEM' });
      }
    }
    return { success: true };
  }

  @Delete(':id') @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    await this.notificationsService.delete(id, user.id);
    return { success: true, data: null };
  }
}
