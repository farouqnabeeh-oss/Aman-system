import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PayrollService } from './payroll.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { RequestUser } from '../common/decorators/current-user.decorator';
import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

class CreatePayrollDto {
  @IsString() userId!: string;
  @IsNumber() @Min(1) @Max(12) month!: number;
  @IsNumber() year!: number;
  @IsNumber() @Min(0) baseSalary!: number;
  @IsNumber() @Min(0) @IsOptional() allowances?: number;
  @IsNumber() @Min(0) @IsOptional() deductions?: number;
  @IsNumber() @Min(0) @IsOptional() bonus?: number;
  @IsString() @IsOptional() notes?: string;
}

@ApiTags('Payroll')
@ApiBearerAuth('JWT')
@UseGuards(RolesGuard)
@Roles('MANAGER', 'ADMIN', 'SUPER_ADMIN')
@Controller('payroll')
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @Get()
  async findAll(@Query('userId') userId?: string, @Query('month') month?: number, @Query('year') year?: number, @Query('page') page = 1, @Query('limit') limit = 20) {
    const result = await this.payrollService.findAll({ userId, month: month ? +month : undefined, year: year ? +year : undefined, page: +page, limit: +limit });
    const totalPages = Math.ceil(result.total / +limit);
    return { success: true, data: { items: result.items, meta: { page: +page, limit: +limit, total: result.total, totalPages, hasNextPage: +page < totalPages, hasPrevPage: +page > 1 } } };
  }

  @Post()
  async create(@Body() dto: CreatePayrollDto, @CurrentUser() actor: RequestUser) {
    return { success: true, data: await this.payrollService.create(dto, actor.id) };
  }

  @Patch(':id/mark-paid') @HttpCode(HttpStatus.OK)
  async markPaid(@Param('id') id: string, @CurrentUser() actor: RequestUser) {
    return { success: true, data: await this.payrollService.markPaid(id, actor.id) };
  }

  @Get('summary')
  async getSummary(@Query('year') year = new Date().getFullYear()) {
    return { success: true, data: await this.payrollService.getSummary(+year) };
  }
}
