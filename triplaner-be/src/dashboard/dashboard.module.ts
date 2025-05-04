import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { TripsModule } from '../trips/trips.module';
import { ActivitiesModule } from '../activities/activities.module';
import { InvitationsModule } from '../invitations/invitations.module';

@Module({
  imports: [
    TripsModule,
    ActivitiesModule,
    InvitationsModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {} 