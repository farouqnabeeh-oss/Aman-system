import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { HrModule } from './hr/hr.module';
import { FinanceModule } from './finance/finance.module';
import { ProjectsModule } from './projects/projects.module';
import { TasksModule } from './tasks/tasks.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PayrollModule } from './payroll/payroll.module';
import { FilesModule } from './files/files.module';
import { AuditLogModule } from './audit-log/audit-log.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { SupabaseModule } from './common/supabase/supabase.module';
import { ThrottlerModule } from '@nestjs/throttler';

import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '../../.env' }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    SupabaseModule,
    PrismaModule,
    AuthModule,
    UsersModule,
    HrModule,
    FinanceModule,
    ProjectsModule,
    TasksModule,
    NotificationsModule,
    PayrollModule,
    FilesModule,
    AuditLogModule,
    DashboardModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
