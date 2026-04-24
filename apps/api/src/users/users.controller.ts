import {
  Controller, Get, Post, Patch, Delete, Body,
  Param, Query, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, UserFiltersDto, BulkActionDto } from './dto/users.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { RequestUser } from '../common/decorators/current-user.decorator';



@UseGuards(RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('MANAGER', 'ADMIN', 'SUPER_ADMIN')
  
  async findAll(@Query() filters: UserFiltersDto) {
    const result = await this.usersService.findAll(filters);
    const totalPages = Math.ceil(result.total / filters.limit);
    return {
      success: true,
      data: {
        items: result.items,
        meta: { page: filters.page, limit: filters.limit, total: result.total, totalPages, hasNextPage: filters.page < totalPages, hasPrevPage: filters.page > 1 },
      },
    };
  }

  @Get(':id')
  
  async findOne(@Param('id') id: string, @CurrentUser() actor: RequestUser) {
    // Users can view themselves; managers+ can view all
    if (actor.role === 'EMPLOYEE' && actor.id !== id) {
      return { success: false, error: { code: 'FORBIDDEN', message: 'Cannot view other users' } };
    }
    const data = await this.usersService.findOne(id);
    return { success: true, data };
  }

  @Post()
  @Roles('MANAGER', 'ADMIN', 'SUPER_ADMIN')
  async create(@Body() dto: CreateUserDto, @CurrentUser() actor: RequestUser) {
    const data = await this.usersService.create(dto, actor.id);
    return { success: true, data };
  }

  @Patch('bulk')
  @Roles('MANAGER', 'ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.OK)
  
  async bulkAction(@Body() dto: BulkActionDto, @CurrentUser() actor: RequestUser) {
    const data = await this.usersService.bulkAction(dto.ids, dto.action, actor.id);
    return { success: true, data };
  }

  @Patch(':id')
  
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto, @CurrentUser() actor: RequestUser) {
    const data = await this.usersService.update(id, dto, actor.id, actor.role);
    return { success: true, data };
  }

  @Delete(':id')
  @Roles('MANAGER', 'ADMIN', 'SUPER_ADMIN')
  
  async remove(@Param('id') id: string, @CurrentUser() actor: RequestUser) {
    await this.usersService.softDelete(id, actor.id);
    return { success: true, data: null };
  }
}
