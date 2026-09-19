import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';

@ApiTags('Admin Dashboard & Analytics')
@Controller('api/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get aggregated dashboard metrics, revenue, and recent activity' })
  getStats() {
    return this.dashboardService.getStats();
  }
}
