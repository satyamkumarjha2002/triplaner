import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invitation } from './entities/invitation.entity';
import { TripsModule } from '../trips/trips.module';
import { UsersModule } from '../users/users.module';
import { InvitationsService } from './invitations.service';
import { InvitationsController } from './invitations.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Invitation]),
    TripsModule,
    UsersModule,
  ],
  providers: [InvitationsService],
  controllers: [InvitationsController],
  exports: [InvitationsService],
})
export class InvitationsModule {} 