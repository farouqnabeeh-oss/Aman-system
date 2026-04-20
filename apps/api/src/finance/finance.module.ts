import { Module } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { FinanceController } from './finance.controller';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({ imports: [AuditLogModule], controllers: [FinanceController], providers: [FinanceService] })
export class FinanceModule {}
