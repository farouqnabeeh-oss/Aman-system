import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { RequestUser } from '../common/decorators/current-user.decorator';
import { IsString, IsOptional, IsEnum, IsNumber, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';
import { Department, ProjectStatus } from '@ems/shared';

class CreateProjectDto {
  @IsString() name!: string;
  @IsString() @IsOptional() description?: string;
  @IsString() managerId!: string;
  @IsString() @IsOptional() clientId?: string;
  @IsEnum(Department) @IsOptional() department?: Department;
  @IsString() startDate!: string;
  @IsString() @IsOptional() endDate?: string;
  @IsNumber() @IsPositive() @IsOptional() budget?: number;
}

class UpdateProjectDto {
  @IsString() @IsOptional() name?: string;
  @IsString() @IsOptional() description?: string;
  @IsEnum(ProjectStatus) @IsOptional() status?: ProjectStatus;
  @IsString() @IsOptional() managerId?: string;
  @IsNumber() @IsOptional() progress?: number;
  @IsString() @IsOptional() endDate?: string;
  @IsNumber() @IsPositive() @IsOptional() budget?: number;
}



@UseGuards(RolesGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  async findAll(@Query('status') status?: string, @Query('department') department?: string, @Query('search') search?: string, @Query('page') page = 1, @Query('limit') limit = 20) {
    const result = await this.projectsService.findAll({ status, department, search, page: +page, limit: +limit });
    const totalPages = Math.ceil(result.total / +limit);
    return { success: true, data: { items: result.items, meta: { page: +page, limit: +limit, total: result.total, totalPages, hasNextPage: +page < totalPages, hasPrevPage: +page > 1 } } };
  }

  @Get(':id') async findOne(@Param('id') id: string) { return { success: true, data: await this.projectsService.findOne(id) }; }

  @Post() @Roles('MANAGER', 'ADMIN', 'SUPER_ADMIN')
  async create(@Body() dto: CreateProjectDto, @CurrentUser() actor: RequestUser) { return { success: true, data: await this.projectsService.create(dto as unknown as Record<string, unknown>, actor.id) }; }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateProjectDto, @CurrentUser() actor: RequestUser) { return { success: true, data: await this.projectsService.update(id, dto as unknown as Record<string, unknown>, actor.id, actor.role) }; }

  @Delete(':id') @Roles('MANAGER', 'ADMIN', 'SUPER_ADMIN') @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string, @CurrentUser() actor: RequestUser) { await this.projectsService.remove(id, actor.id); return { success: true, data: null }; }
}
