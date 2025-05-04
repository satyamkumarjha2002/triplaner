import { Controller, Get, UseGuards, Req, ClassSerializerInterceptor, UseInterceptors } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DashboardService } from './dashboard.service';
import { User } from '../users/entities/user.entity';
import { Request } from 'express';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  async getDashboardData(@Req() req: Request) {
    const user = req.user as User;
    return this.dashboardService.getDashboardData(user);
  }
} 