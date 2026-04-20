import { Module } from '@nestjs/common';
import { PayrollService } from './payroll.service';
import { PayrollController } from './payroll.controller';
import { AuditLogModule } from '../audit-log/audit-log.module';
@Module({ imports: [AuditLogModule], controllers: [PayrollController], providers: [PayrollService] })
export class PayrollModule {}
