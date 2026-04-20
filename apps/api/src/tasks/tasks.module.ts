import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { AuditLogModule } from '../audit-log/audit-log.module';
@Module({ imports: [AuditLogModule], controllers: [TasksController], providers: [TasksService] })
export class TasksModule {}
