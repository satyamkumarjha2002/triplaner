import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invitation } from './entities/invitation.entity';
import { TripsModule } from '../trips/trips.module';
import { UsersModule } from '../users/users.module';
import { EmailModule } from '../email/email.module';
import { InvitationsService } from './invitations.service';
import { InvitationsController } from './invitations.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Invitation]),
    TripsModule,
    UsersModule,
    EmailModule,
  ],
  providers: [InvitationsService],
  controllers: [InvitationsController],
  exports: [InvitationsService],
})
export class InvitationsModule {}
