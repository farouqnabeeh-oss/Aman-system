import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuditLogService } from './audit-log.service';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('Audit Logs')
@ApiBearerAuth('JWT')
@UseGuards(RolesGuard)
@Controller('audit-logs')
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()  
  @Roles('MANAGER', 'ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Get paginated audit logs (manager/admin access)' })
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('userId') userId?: string,
    @Query('entity') entity?: string,
    @Query('action') action?: string,
  ) {
    const result = await this.auditLogService.findAll(+page, +limit, { userId, entity, action });
    const totalPages = Math.ceil(result.total / +limit);
    return {
      success: true,
      data: {
        items: result.items,
        meta: { page: +page, limit: +limit, total: result.total, totalPages, hasNextPage: +page < totalPages, hasPrevPage: +page > 1 },
      },
    };
  }
}
