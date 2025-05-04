import { Controller, Post, Delete, Body, Param, UseGuards, Req, ClassSerializerInterceptor, UseInterceptors } from '@nestjs/common';
import { VotesService } from './votes.service';
import { CreateVoteDto } from './dto/create-vote.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { User } from '../users/entities/user.entity';

@Controller('trips/:tripId/activities/:activityId/vote')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class VotesController {
  constructor(private readonly votesService: VotesService) {}

  @Post()
  createVote(
    @Param('tripId') tripId: string,
    @Param('activityId') activityId: string,
    @Body() createVoteDto: CreateVoteDto,
    @Req() req: Request,
  ) {
    const user = req.user as User;
    return this.votesService.createVote(tripId, activityId, createVoteDto, user);
  }

  @Delete()
  removeVote(
    @Param('tripId') tripId: string,
    @Param('activityId') activityId: string,
    @Req() req: Request,
  ) {
    const user = req.user as User;
    return this.votesService.removeVote(tripId, activityId, user.id);
  }
} 