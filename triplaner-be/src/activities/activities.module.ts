import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Activity } from './entities/activity.entity';
import { Vote } from './entities/vote.entity';
import { ActivitiesService } from './activities.service';
import { ActivitiesController } from './activities.controller';
import { VotesService } from './votes.service';
import { VotesController } from './votes.controller';
import { TripsModule } from '../trips/trips.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Activity, Vote]),
    TripsModule,
    UsersModule,
  ],
  providers: [ActivitiesService, VotesService],
  controllers: [ActivitiesController, VotesController],
  exports: [ActivitiesService, VotesService],
})
export class ActivitiesModule {} 