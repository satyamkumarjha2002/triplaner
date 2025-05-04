import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trip } from './entities/trip.entity';
import { TripsService } from './trips.service';
import { TripsController } from './trips.controller';
import { UsersModule } from '../users/users.module';
import { Invitation } from '../invitations/entities/invitation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Trip, Invitation]),
    UsersModule,
  ],
  providers: [TripsService],
  controllers: [TripsController],
  exports: [TripsService],
})
export class TripsModule {} 