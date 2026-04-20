import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({ imports: [AuditLogModule], controllers: [ProjectsController], providers: [ProjectsService] })
export class ProjectsModule {}
