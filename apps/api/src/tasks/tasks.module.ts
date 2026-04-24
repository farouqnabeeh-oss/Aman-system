import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { TaskCommentsService } from './comments.service';
import { TaskCommentsController } from './comments.controller';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({ 
  imports: [AuditLogModule], 
  controllers: [TasksController, TaskCommentsController], 
  providers: [TasksService, TaskCommentsService] 
})
export class TasksModule {}
