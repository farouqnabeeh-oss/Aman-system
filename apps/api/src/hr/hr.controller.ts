import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { HrService } from './hr.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { RequestUser } from '../common/decorators/current-user.decorator';
import { IsString, IsOptional, IsEnum } from 'class-validator';
import { LeaveType, LeaveStatus } from '@ems/shared';

class CreateLeaveDto {
  @IsEnum(LeaveType) type!: LeaveType;
  @IsString() startDate!: string;
  @IsString() endDate!: string;
  @IsString() @IsOptional() reason?: string;
}
class ReviewLeaveDto {
  @IsEnum(['APPROVED', 'REJECTED']) status!: 'APPROVED' | 'REJECTED';
  @IsString() @IsOptional() rejectionReason?: string;
}



@UseGuards(RolesGuard)
@Controller('hr')
export class HrController {
  constructor(private readonly hrService: HrService) {}

  @Get('leaves')
  async getLeaves(@CurrentUser() actor: RequestUser, @Query('userId') userId?: string, @Query('status') status?: string, @Query('page') page = 1, @Query('limit') limit = 20) {
    const effectiveUserId = actor.role === 'EMPLOYEE' ? actor.id : userId;
    const result = await this.hrService.getLeaves({ userId: effectiveUserId, status, page: +page, limit: +limit });
    const totalPages = Math.ceil(result.total / +limit);
    return { success: true, data: { items: result.items, meta: { page: +page, limit: +limit, total: result.total, totalPages, hasNextPage: +page < totalPages, hasPrevPage: +page > 1 } } };
  }

  @Post('leaves')
  async createLeave(@Body() dto: CreateLeaveDto, @CurrentUser() actor: RequestUser) {
    return { success: true, data: await this.hrService.createLeave(dto, actor.id) };
  }

  @Patch('leaves/:id/review') @Roles('MANAGER', 'ADMIN', 'SUPER_ADMIN') @HttpCode(HttpStatus.OK)
  async reviewLeave(@Param('id') id: string, @Body() dto: ReviewLeaveDto, @CurrentUser() actor: RequestUser) {
    return { success: true, data: await this.hrService.reviewLeave(id, dto.status, actor.id, dto.rejectionReason) };
  }

  @Get('attendance')
  async getAttendance(@CurrentUser() actor: RequestUser, @Query('userId') userId?: string, @Query('dateFrom') dateFrom?: string, @Query('dateTo') dateTo?: string, @Query('page') page = 1, @Query('limit') limit = 20) {
    const effectiveUserId = actor.role === 'EMPLOYEE' ? actor.id : userId;
    const result = await this.hrService.getAttendance({ userId: effectiveUserId, dateFrom, dateTo, page: +page, limit: +limit });
    const totalPages = Math.ceil(result.total / +limit);
    return { success: true, data: { items: result.items, meta: { page: +page, limit: +limit, total: result.total, totalPages, hasNextPage: +page < totalPages, hasPrevPage: +page > 1 } } };
  }

  @Post('attendance/check-in') @HttpCode(HttpStatus.OK)
  async checkIn(@CurrentUser() actor: RequestUser) { return { success: true, data: await this.hrService.checkIn(actor.id) }; }

  @Post('attendance/check-out') @HttpCode(HttpStatus.OK)
  async checkOut(@CurrentUser() actor: RequestUser) { return { success: true, data: await this.hrService.checkOut(actor.id) }; }
}
