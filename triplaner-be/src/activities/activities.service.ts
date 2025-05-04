import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Activity } from './entities/activity.entity';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { User } from '../users/entities/user.entity';
import { TripsService } from '../trips/trips.service';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectRepository(Activity)
    private activitiesRepository: Repository<Activity>,
    private tripsService: TripsService,
  ) {}

  async findTripActivities(tripId: string, userId: string): Promise<Activity[]> {
    // Check if user is a participant of the trip
    const trip = await this.tripsService.findOne(tripId);
    const isParticipant = trip.participants.some(p => p.id === userId);
    
    if (!isParticipant) {
      throw new ForbiddenException('You do not have access to this trip');
    }
    
    return this.activitiesRepository.find({
      where: { tripId },
      relations: ['creator', 'votes', 'votes.user'],
    });
  }

  async findByTripIds(tripIds: string[]): Promise<Activity[]> {
    if (!tripIds.length) {
      return [];
    }
    
    return this.activitiesRepository.find({
      where: { tripId: In(tripIds) },
      relations: ['creator', 'votes', 'votes.user'],
    });
  }

  async findOne(tripId: string, activityId: string, userId: string): Promise<Activity> {
    // Check if user is a participant of the trip
    const trip = await this.tripsService.findOne(tripId);
    const isParticipant = trip.participants.some(p => p.id === userId);
    
    if (!isParticipant) {
      throw new ForbiddenException('You do not have access to this trip');
    }
    
    const activity = await this.activitiesRepository.findOne({
      where: { id: activityId, tripId },
      relations: ['creator', 'votes', 'votes.user'],
    });
    
    if (!activity) {
      throw new NotFoundException(`Activity with ID "${activityId}" not found`);
    }
    
    return activity;
  }

  async create(tripId: string, createActivityDto: CreateActivityDto, user: User): Promise<Activity> {
    // Check if user is a participant of the trip
    const trip = await this.tripsService.findOne(tripId);
    const isParticipant = trip.participants.some(p => p.id === user.id);
    
    if (!isParticipant) {
      throw new ForbiddenException('You do not have access to this trip');
    }
    
    // Create and save the activity
    const activity = this.activitiesRepository.create({
      ...createActivityDto,
      tripId,
      creatorId: user.id,
      creator: user,
    });
    
    return this.activitiesRepository.save(activity);
  }

  async update(tripId: string, activityId: string, updateActivityDto: UpdateActivityDto, userId: string): Promise<Activity> {
    const activity = await this.findOne(tripId, activityId, userId);
    
    // Only creator can update the activity
    if (activity.creatorId !== userId) {
      throw new ForbiddenException('You do not have permission to update this activity');
    }
    
    // Update activity
    Object.assign(activity, updateActivityDto);
    return this.activitiesRepository.save(activity);
  }

  async remove(tripId: string, activityId: string, userId: string): Promise<void> {
    const activity = await this.findOne(tripId, activityId, userId);
    
    // Only creator can delete the activity
    if (activity.creatorId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this activity');
    }
    
    await this.activitiesRepository.remove(activity);
  }
} 