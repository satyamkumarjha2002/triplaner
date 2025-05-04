import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Req, ClassSerializerInterceptor, UseInterceptors } from '@nestjs/common';
import { TripsService } from './trips.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { User } from '../users/entities/user.entity';

@Controller('trips')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Get()
  findUserTrips(@Req() req: Request) {
    const user = req.user as User;
    return this.tripsService.findUserTrips(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tripsService.findOne(id);
  }

  @Post()
  create(@Body() createTripDto: CreateTripDto, @Req() req: Request) {
    const user = req.user as User;
    return this.tripsService.create(createTripDto, user);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateTripDto: UpdateTripDto, @Req() req: Request) {
    const user = req.user as User;
    return this.tripsService.update(id, updateTripDto, user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as User;
    return this.tripsService.remove(id, user.id);
  }

  @Post('join')
  joinTripByCode(@Body('tripCode') tripCode: string, @Req() req: Request) {
    const user = req.user as User;
    return this.tripsService.findByTripCode(tripCode)
      .then(trip => this.tripsService.addParticipant(trip.id, user));
  }
} 