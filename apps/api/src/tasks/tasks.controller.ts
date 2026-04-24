import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { RequestUser } from '../common/decorators/current-user.decorator';
import { IsString, IsOptional, IsEnum, IsNumber, IsArray, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';
import { TaskStatus, TaskPriority } from '@ems/shared';

class CreateTaskDto {
  @IsString() title!: string;
  @IsString() @IsOptional() description?: string;
  @IsEnum(TaskPriority) @IsOptional() priority?: TaskPriority;
  @IsString() projectId!: string;
  @IsString() @IsOptional() assigneeId?: string;
  @IsString() @IsOptional() dueDate?: string;
  @IsNumber() @IsPositive() @IsOptional() estimatedHours?: number;
  @IsArray() @IsOptional() tags?: string[];
}

class UpdateTaskDto {
  @IsString() @IsOptional() title?: string;
  @IsString() @IsOptional() description?: string;
  @IsEnum(TaskStatus) @IsOptional() status?: TaskStatus;
  @IsEnum(TaskPriority) @IsOptional() priority?: TaskPriority;
  @IsString() @IsOptional() assigneeId?: string;
  @IsString() @IsOptional() dueDate?: string;
  @IsNumber() @IsPositive() @IsOptional() estimatedHours?: number;
  @IsNumber() @IsPositive() @IsOptional() actualHours?: number;
  @IsArray() @IsOptional() tags?: string[];
}

class AddCommentDto { @IsString() content!: string; }



@UseGuards(RolesGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  async findAll(@Query('projectId') projectId?: string, @Query('assigneeId') assigneeId?: string, @Query('status') status?: string, @Query('priority') priority?: string, @Query('page') page = 1, @Query('limit') limit = 20) {
    const result = await this.tasksService.findAll({ projectId, assigneeId, status, priority, page: +page, limit: +limit });
    const totalPages = Math.ceil(result.total / +limit);
    return { success: true, data: { items: result.items, meta: { page: +page, limit: +limit, total: result.total, totalPages, hasNextPage: +page < totalPages, hasPrevPage: +page > 1 } } };
  }

  @Get(':id') async findOne(@Param('id') id: string) { return { success: true, data: await this.tasksService.findOne(id) }; }
  @Post() async create(@Body() dto: CreateTaskDto, @CurrentUser() actor: RequestUser) { return { success: true, data: await this.tasksService.create(dto as unknown as Record<string, unknown>, actor.id) }; }
  @Patch(':id') async update(@Param('id') id: string, @Body() dto: UpdateTaskDto, @CurrentUser() actor: RequestUser) { return { success: true, data: await this.tasksService.update(id, dto as unknown as Record<string, unknown>, actor.id, actor.role) }; }
  @Delete(':id') @HttpCode(HttpStatus.OK) async remove(@Param('id') id: string, @CurrentUser() actor: RequestUser) { await this.tasksService.remove(id, actor.id); return { success: true, data: null }; }
  @Post(':id/comments') async addComment(@Param('id') id: string, @Body() dto: AddCommentDto, @CurrentUser() actor: RequestUser) { return { success: true, data: await this.tasksService.addComment(id, dto.content, actor.id) }; }
  @Get(':id/comments') async getComments(@Param('id') id: string) { return { success: true, data: await this.tasksService.getComments(id) }; }
}
