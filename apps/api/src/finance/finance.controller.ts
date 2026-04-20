import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { FinanceService } from './finance.service';
import { CreateTransactionDto, TransactionFiltersDto, CreateInvoiceDto, UpdateInvoiceDto, InvoiceFiltersDto, CreateClientDto } from './dto/finance.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { RequestUser } from '../common/decorators/current-user.decorator';

@ApiTags('Finance')
@ApiBearerAuth('JWT')
@UseGuards(RolesGuard)
@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get('summary') @Roles('MANAGER', 'ADMIN', 'SUPER_ADMIN') @ApiOperation({ summary: 'YTD financial summary' })
  async getSummary() { return { success: true, data: await this.financeService.getFinancialSummary() }; }

  @Get('transactions') @Roles('MANAGER', 'ADMIN', 'SUPER_ADMIN') @ApiOperation({ summary: 'List transactions with filters' })
  async getTransactions(@Query() filters: TransactionFiltersDto) {
    const result = await this.financeService.getTransactions(filters);
    const totalPages = Math.ceil(result.total / filters.limit);
    return { success: true, data: { items: result.items, meta: { page: filters.page, limit: filters.limit, total: result.total, totalPages, hasNextPage: filters.page < totalPages, hasPrevPage: filters.page > 1 } } };
  }

  @Post('transactions') @Roles('MANAGER', 'ADMIN', 'SUPER_ADMIN') @ApiOperation({ summary: 'Create transaction' })
  async createTransaction(@Body() dto: CreateTransactionDto, @CurrentUser() actor: RequestUser) {
    return { success: true, data: await this.financeService.createTransaction(dto, actor.id) };
  }

  @Delete('transactions/:id') @Roles('ADMIN', 'SUPER_ADMIN') @HttpCode(HttpStatus.OK)
  async deleteTransaction(@Param('id') id: string, @CurrentUser() actor: RequestUser) {
    await this.financeService.deleteTransaction(id, actor.id);
    return { success: true, data: null };
  }

  @Get('invoices') @Roles('MANAGER', 'ADMIN', 'SUPER_ADMIN') @ApiOperation({ summary: 'List invoices' })
  async getInvoices(@Query() filters: InvoiceFiltersDto) {
    const result = await this.financeService.getInvoices(filters);
    const totalPages = Math.ceil(result.total / filters.limit);
    return { success: true, data: { items: result.items, meta: { page: filters.page, limit: filters.limit, total: result.total, totalPages, hasNextPage: filters.page < totalPages, hasPrevPage: filters.page > 1 } } };
  }

  @Get('invoices/:id') @ApiOperation({ summary: 'Get invoice by ID' })
  async getInvoice(@Param('id') id: string) { return { success: true, data: await this.financeService.getInvoiceById(id) }; }

  @Post('invoices') @Roles('MANAGER', 'ADMIN', 'SUPER_ADMIN') @ApiOperation({ summary: 'Create invoice' })
  async createInvoice(@Body() dto: CreateInvoiceDto, @CurrentUser() actor: RequestUser) {
    return { success: true, data: await this.financeService.createInvoice(dto, actor.id) };
  }

  @Patch('invoices/:id') @Roles('MANAGER', 'ADMIN', 'SUPER_ADMIN') @ApiOperation({ summary: 'Update invoice' })
  async updateInvoice(@Param('id') id: string, @Body() dto: UpdateInvoiceDto, @CurrentUser() actor: RequestUser) {
    return { success: true, data: await this.financeService.updateInvoice(id, dto, actor.id) };
  }

  @Get('clients') @Roles('MANAGER', 'ADMIN', 'SUPER_ADMIN')
  async getClients(@Query('search') search?: string) { return { success: true, data: await this.financeService.getClients(search) }; }

  @Post('clients') @Roles('MANAGER', 'ADMIN', 'SUPER_ADMIN')
  async createClient(@Body() dto: CreateClientDto, @CurrentUser() actor: RequestUser) {
    return { success: true, data: await this.financeService.createClient(dto, actor.id) };
  }

  @Get('budgets') @Roles('MANAGER', 'ADMIN', 'SUPER_ADMIN')
  async getBudgets(@Query('year') year?: number, @Query('month') month?: number) {
    return { success: true, data: await this.financeService.getBudgets(year ? +year : undefined, month ? +month : undefined) };
  }
}
