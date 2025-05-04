import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Req,
  ClassSerializerInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { User } from '../users/entities/user.entity';

@Controller('trips/:tripId/activities')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Get()
  findTripActivities(@Param('tripId') tripId: string, @Req() req: Request) {
    const user = req.user as User;
    return this.activitiesService.findTripActivities(tripId, user.id);
  }

  @Get(':id')
  findOne(
    @Param('tripId') tripId: string,
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    const user = req.user as User;
    return this.activitiesService.findOne(tripId, id, user.id);
  }

  @Post()
  create(
    @Param('tripId') tripId: string,
    @Body() createActivityDto: CreateActivityDto,
    @Req() req: Request,
  ) {
    const user = req.user as User;
    return this.activitiesService.create(tripId, createActivityDto, user);
  }

  @Put(':id')
  update(
    @Param('tripId') tripId: string,
    @Param('id') id: string,
    @Body() updateActivityDto: UpdateActivityDto,
    @Req() req: Request,
  ) {
    const user = req.user as User;
    return this.activitiesService.update(
      tripId,
      id,
      updateActivityDto,
      user.id,
    );
  }

  @Delete(':id')
  remove(
    @Param('tripId') tripId: string,
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    const user = req.user as User;
    return this.activitiesService.remove(tripId, id, user.id);
  }
}
