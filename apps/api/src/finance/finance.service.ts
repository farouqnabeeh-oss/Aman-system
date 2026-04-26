import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { toIUserPublic } from '../common/utils/mapping-utils';
import type { TransactionType, TransactionStatus, InvoiceStatus, Department, PaymentMethod } from '@ems/shared';
import type { CreateTransactionDto, TransactionFiltersDto } from './dto/finance.dto';
import type { CreateInvoiceDto, UpdateInvoiceDto, InvoiceFiltersDto } from './dto/finance.dto';
import type { CreateClientDto } from './dto/finance.dto';

const USER_SELECT = { id: true, firstName: true, lastName: true, email: true, avatarUrl: true, role: true, department: true, position: true };

@Injectable()
export class FinanceService {
  constructor(private readonly prisma: PrismaService, private readonly auditLog: AuditLogService) {}

  // ── Transactions ──────────────────────────────────────────────────────────
  async getTransactions(filters: TransactionFiltersDto) {
    const { type, status, department, category, search, dateFrom, dateTo, page, limit, sortBy, sortOrder } = filters;
    const where = {
      ...(type ? { type } : {}),
      ...(status ? { status } : {}),
      ...(department ? { department } : {}),
      ...(category ? { category } : {}),
      ...(search ? { OR: [{ description: { contains: search } }, { reference: { contains: search } }] } : {}),
      ...(dateFrom || dateTo ? { transactionDate: { ...(dateFrom ? { gte: new Date(dateFrom) } : {}), ...(dateTo ? { lte: new Date(dateTo) } : {}) } } : {}),
    };

    const [total, items] = await Promise.all([
      this.prisma.transaction.count({ where }),
      this.prisma.transaction.findMany({
        where,
        include: { createdBy: { select: USER_SELECT } },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);
    return { items: items.map(this.serializeTransaction), total };
  }

  async createTransaction(dto: CreateTransactionDto, userId: string) {
    const tx = await this.prisma.transaction.create({
      data: { ...dto, createdById: userId, transactionDate: dto.transactionDate ? new Date(dto.transactionDate) : new Date() },
      include: { createdBy: { select: USER_SELECT } },
    });
    await this.auditLog.log({ userId, action: 'CREATE', entity: 'transactions', entityId: tx.id, newValues: { amount: Number(tx.amount), type: tx.type } });
    return this.serializeTransaction(tx);
  }

  async deleteTransaction(id: string, userId: string) {
    await this.prisma.transaction.findFirstOrThrow({ where: { id } });
    await this.prisma.transaction.delete({ where: { id } });
    await this.auditLog.log({ userId, action: 'DELETE', entity: 'transactions', entityId: id });
  }

  async updateTransaction(id: string, dto: any, userId: string) {
    const existing = await this.prisma.transaction.findUnique({ where: { id } });
    if (!existing) throw new Error('Transaction not found');
    const { amount, transactionDate, ...rest } = dto;
    const updated = await this.prisma.transaction.update({
      where: { id },
      data: {
        ...rest,
        ...(amount !== undefined ? { amount: Number(amount) } : {}),
        ...(transactionDate ? { transactionDate: new Date(transactionDate) } : {}),
      },
      include: { createdBy: { select: USER_SELECT } },
    });
    await this.auditLog.log({ userId, action: 'UPDATE', entity: 'transactions', entityId: id, newValues: dto });
    return this.serializeTransaction(updated);
  }

  // ── Invoices ──────────────────────────────────────────────────────────────
  async getInvoices(filters: InvoiceFiltersDto) {
    const { clientId, status, dateFrom, dateTo, page, limit } = filters;
    const where = {
      ...(clientId ? { clientId } : {}),
      ...(status ? { status } : {}),
      ...(dateFrom || dateTo ? { dueDate: { ...(dateFrom ? { gte: new Date(dateFrom) } : {}), ...(dateTo ? { lte: new Date(dateTo) } : {}) } } : {}),
    };
    const [total, items] = await Promise.all([
      this.prisma.invoice.count({ where }),
      this.prisma.invoice.findMany({ where, include: { client: true, lineItems: { orderBy: { sortOrder: 'asc' } }, createdBy: { select: USER_SELECT } }, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
    ]);
    return { items: items.map(this.serializeInvoice), total };
  }

  async getInvoiceById(id: string) {
    const inv = await this.prisma.invoice.findUnique({ where: { id }, include: { client: true, lineItems: { orderBy: { sortOrder: 'asc' } }, createdBy: { select: USER_SELECT } } });
    if (!inv) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Invoice not found' });
    return this.serializeInvoice(inv);
  }

  async createInvoice(dto: CreateInvoiceDto, userId: string) {
    const subtotal = dto.lineItems.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
    const taxAmount = (subtotal * dto.taxRate) / 100;
    const total = subtotal + taxAmount - dto.discount;
    const count = await this.prisma.invoice.count();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const inv = await this.prisma.invoice.create({
      data: {
        invoiceNumber, clientId: dto.clientId, dueDate: new Date(dto.dueDate),
        taxRate: dto.taxRate, taxAmount, discount: dto.discount, subtotal, total,
        currency: dto.currency ?? 'USD', notes: dto.notes, createdById: userId,
        lineItems: { create: dto.lineItems.map((li) => ({ ...li, total: li.quantity * li.unitPrice })) },
      },
      include: { client: true, lineItems: { orderBy: { sortOrder: 'asc' } }, createdBy: { select: USER_SELECT } },
    });

    await this.auditLog.log({ userId, action: 'CREATE', entity: 'invoices', entityId: inv.id, newValues: { invoiceNumber, total } });
    return this.serializeInvoice(inv);
  }

  async updateInvoice(id: string, dto: UpdateInvoiceDto, userId: string) {
    const existing = await this.prisma.invoice.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Invoice not found' });

    const updateData: Record<string, unknown> = { ...dto };
    if (dto.lineItems) {
      const subtotal = dto.lineItems.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
      const taxRate = dto.taxRate ?? Number(existing.taxRate);
      const taxAmount = (subtotal * taxRate) / 100;
      const discount = dto.discount ?? Number(existing.discount);
      updateData['subtotal'] = subtotal;
      updateData['taxAmount'] = taxAmount;
      updateData['total'] = subtotal + taxAmount - discount;

      await this.prisma.invoiceLineItem.deleteMany({ where: { invoiceId: id } });
      await this.prisma.invoiceLineItem.createMany({ data: dto.lineItems.map((li) => ({ ...li, invoiceId: id, total: li.quantity * li.unitPrice })) });
      delete updateData['lineItems'];
    }
    if (dto.dueDate) updateData['dueDate'] = new Date(dto.dueDate);

    const updated = await this.prisma.invoice.update({ where: { id }, data: updateData, include: { client: true, lineItems: { orderBy: { sortOrder: 'asc' } }, createdBy: { select: USER_SELECT } } });
    await this.auditLog.log({ userId, action: 'UPDATE', entity: 'invoices', entityId: id, newValues: { status: dto.status } });
    return this.serializeInvoice(updated);
  }

  // ── Clients ───────────────────────────────────────────────────────────────
  async getClients(search?: string) {
    return this.prisma.client.findMany({
      where: search ? { OR: [{ name: { contains: search } }, { company: { contains: search } }, { email: { contains: search } }] } : undefined,
      orderBy: { name: 'asc' },
    });
  }

  async createClient(dto: CreateClientDto, userId: string) {
    const client = await this.prisma.client.create({ data: { ...dto, createdById: userId } });
    await this.auditLog.log({ userId, action: 'CREATE', entity: 'clients', entityId: client.id });
    return client;
  }

  // ── Budget ────────────────────────────────────────────────────────────────
  async getBudgets(year?: number, month?: number) {
    const now = new Date();
    return this.prisma.budgetAllocation.findMany({
      where: { year: year ?? now.getFullYear(), month: month ?? now.getMonth() + 1 },
      orderBy: { department: 'asc' },
    });
  }

  async getFinancialSummary() {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const [income, expense, invoiceStats] = await Promise.all([
      this.prisma.transaction.aggregate({ _sum: { amount: true }, where: { type: 'INCOME', status: 'COMPLETED', transactionDate: { gte: startOfYear } } }),
      this.prisma.transaction.aggregate({ _sum: { amount: true }, where: { type: 'EXPENSE', status: 'COMPLETED', transactionDate: { gte: startOfYear } } }),
      this.prisma.invoice.groupBy({ by: ['status'], _count: true, _sum: { total: true } }),
    ]);
    const totalIncome = Number(income._sum.amount ?? 0);
    const totalExpense = Number(expense._sum.amount ?? 0);
    return { totalIncome, totalExpense, netProfit: totalIncome - totalExpense, profitMargin: totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0, invoicesByStatus: invoiceStats };
  }

  private serializeTransaction = (tx: any) => ({
    ...tx,
    type: tx.type as TransactionType,
    status: tx.status as TransactionStatus,
    department: tx.department as Department | null,
    paymentMethod: tx.paymentMethod as PaymentMethod | null,
    amount: Number(tx['amount']),
    createdBy: toIUserPublic(tx.createdBy),
  });

  private serializeInvoice = (inv: any) => ({
    ...inv,
    status: inv.status as InvoiceStatus,
    subtotal: Number(inv['subtotal']),
    taxAmount: Number(inv['taxAmount']),
    discount: Number(inv['discount']),
    total: Number(inv['total']),
    taxRate: Number(inv['taxRate']),
    lineItems: Array.isArray(inv['lineItems']) ? (inv['lineItems'] as Record<string, unknown>[]).map((li) => ({ ...li, quantity: Number(li['quantity']), unitPrice: Number(li['unitPrice']), total: Number(li['total']) })) : [],
    createdBy: toIUserPublic(inv.createdBy),
  });
}
