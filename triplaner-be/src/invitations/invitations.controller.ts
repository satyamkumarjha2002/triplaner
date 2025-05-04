import { Controller, Get, Post, Put, Param, Body, UseGuards, Req, ClassSerializerInterceptor, UseInterceptors } from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { DeclineInvitationDto } from './dto/decline-invitation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { User } from '../users/entities/user.entity';

@Controller()
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Get('invitations')
  findUserInvitations(@Req() req: Request) {
    const user = req.user as User;
    return this.invitationsService.findUserInvitations(user.id);
  }

  @Get('trips/:tripId/invitations')
  findTripInvitations(@Param('tripId') tripId: string, @Req() req: Request) {
    const user = req.user as User;
    return this.invitationsService.findTripInvitations(tripId, user.id);
  }

  @Post('trips/:tripId/invitations')
  create(
    @Param('tripId') tripId: string,
    @Body() createInvitationDto: CreateInvitationDto,
    @Req() req: Request,
  ) {
    const user = req.user as User;
    return this.invitationsService.create(tripId, createInvitationDto, user);
  }

  @Put('invitations/:id/accept')
  accept(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as User;
    return this.invitationsService.accept(id, user.email);
  }

  @Put('invitations/:id/decline')
  decline(
    @Param('id') id: string,
    @Body() declineInvitationDto: DeclineInvitationDto,
    @Req() req: Request
  ) {
    const user = req.user as User;
    return this.invitationsService.decline(id, user.email, declineInvitationDto.reason);
  }
} 