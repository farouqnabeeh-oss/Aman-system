import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

// 
// 
@UseGuards(RolesGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('kpis')
  @Roles('MANAGER', 'ADMIN', 'SUPER_ADMIN')
  // 
  async getKPIs() {
    const data = await this.dashboardService.getKPIs();
    return { success: true, data };
  }

  @Get('revenue-chart')
  @Roles('MANAGER', 'ADMIN', 'SUPER_ADMIN')
  // 
  async getRevenueChart() {
    const data = await this.dashboardService.getRevenueChart();
    return { success: true, data };
  }

  @Get('department-performance')
  @Roles('MANAGER', 'ADMIN', 'SUPER_ADMIN')
  // 
  async getDepartmentPerformance() {
    const data = await this.dashboardService.getDepartmentPerformance();
    return { success: true, data };
  }

  @Get('recent-activity')
  @Roles('MANAGER', 'ADMIN', 'SUPER_ADMIN')
  // 
  async getRecentActivity(@Query('limit') limit: string = '15') {
    const data = await this.dashboardService.getRecentActivity(+limit);
    return { success: true, data };
  }
}
