import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { databaseConfig } from './config/database.config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TripsModule } from './trips/trips.module';
import { ActivitiesModule } from './activities/activities.module';
import { InvitationsModule } from './invitations/invitations.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig),
    UsersModule,
    AuthModule,
    TripsModule,
    ActivitiesModule,
    InvitationsModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
