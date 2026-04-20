import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { toIUserPublic } from '../common/utils/mapping-utils';

const USER_SEL = { id: true, firstName: true, lastName: true, email: true, avatarUrl: true, role: true, department: true, position: true };

@Injectable()
export class PayrollService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditLogService) {}

  async findAll(filters: { userId?: string; month?: number; year?: number; page: number; limit: number }) {
    const { userId, month, year, page, limit } = filters;
    const where = { ...(userId ? { userId } : {}), ...(month ? { month } : {}), ...(year ? { year } : { year: new Date().getFullYear() }) };
    const [total, items] = await Promise.all([
      this.prisma.payrollRecord.count({ where }),
      this.prisma.payrollRecord.findMany({ where, include: { user: { select: USER_SEL }, processedBy: { select: USER_SEL } }, orderBy: [{ year: 'desc' }, { month: 'desc' }], skip: (page - 1) * limit, take: limit }),
    ]);
    return { items: items.map(this.serialize), total };
  }

  async create(dto: { userId: string; month: number; year: number; baseSalary: number; allowances?: number; deductions?: number; bonus?: number; notes?: string }, processedById: string) {
    const existing = await this.prisma.payrollRecord.findUnique({ where: { userId_month_year: { userId: dto.userId, month: dto.month, year: dto.year } } });
    if (existing) throw new ConflictException({ code: 'PAYROLL_ALREADY_PROCESSED', message: 'Payroll already exists for this user/month/year' });

    const allowances = dto.allowances ?? 0;
    const deductions = dto.deductions ?? 0;
    const bonus = dto.bonus ?? 0;
    const netSalary = dto.baseSalary + allowances + bonus - deductions;

    const record = await this.prisma.payrollRecord.create({
      data: { userId: dto.userId, month: dto.month, year: dto.year, baseSalary: dto.baseSalary, allowances, deductions, bonus, netSalary, processedById, notes: dto.notes },
      include: { user: { select: USER_SEL } },
    });
    await this.audit.log({ userId: processedById, action: 'CREATE', entity: 'payroll_records', entityId: record.id, newValues: { netSalary, month: dto.month, year: dto.year } });
    return this.serialize(record);
  }

  async markPaid(id: string, userId: string) {
    const record = await this.prisma.payrollRecord.findUnique({ where: { id } });
    if (!record) throw new NotFoundException({ code: 'NOT_FOUND', message: 'Payroll record not found' });
    const updated = await this.prisma.payrollRecord.update({ where: { id }, data: { isPaid: true, paidAt: new Date() }, include: { user: { select: USER_SEL } } });
    await this.audit.log({ userId, action: 'UPDATE', entity: 'payroll_records', entityId: id, newValues: { isPaid: true } });
    return this.serialize(updated);
  }

  async getSummary(year: number) {
    const records = await this.prisma.payrollRecord.findMany({ where: { year }, select: { month: true, netSalary: true, isPaid: true } });
    const byMonth = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const monthRecords = records.filter((r) => r.month === month);
      return { month, totalPayroll: monthRecords.reduce((s, r) => s + Number(r.netSalary), 0), paidCount: monthRecords.filter((r) => r.isPaid).length, unpaidCount: monthRecords.filter((r) => !r.isPaid).length };
    });
    return byMonth;
  }

  private serialize = (r: any) => ({
    ...r,
    baseSalary: Number(r['baseSalary']),
    allowances: Number(r['allowances']),
    deductions: Number(r['deductions']),
    bonus: Number(r['bonus']),
    netSalary: Number(r['netSalary']),
    paidAt: r['paidAt'] ? (r['paidAt'] as Date).toISOString() : null,
    createdAt: (r['createdAt'] as Date).toISOString(),
    updatedAt: (r['updatedAt'] as Date).toISOString(),
    user: toIUserPublic(r.user),
    processedBy: toIUserPublic(r.processedBy),
  });
}
