import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { AuditLogModule } from '../audit-log/audit-log.module';
@Module({ imports: [AuditLogModule], controllers: [FilesController], providers: [FilesService] })
export class FilesModule {}
