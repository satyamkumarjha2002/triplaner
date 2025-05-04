import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes } from 'crypto';
import { Trip } from './entities/trip.entity';
import { User } from '../users/entities/user.entity';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { Invitation, InvitationStatus } from '../invitations/entities/invitation.entity';

@Injectable()
export class TripsService {
  constructor(
    @InjectRepository(Trip)
    private tripsRepository: Repository<Trip>,
    @InjectRepository(Invitation)
    private invitationsRepository: Repository<Invitation>,
  ) {}

  async findAll(): Promise<Trip[]> {
    return this.tripsRepository.find({
      relations: ['creator', 'participants'],
    });
  }

  async findUserTrips(userId: string): Promise<Trip[]> {
    return this.tripsRepository
      .createQueryBuilder('trip')
      .leftJoinAndSelect('trip.creator', 'creator')
      .leftJoinAndSelect('trip.participants', 'participants')
      .where('trip.creatorId = :userId', { userId })
      .orWhere('participants.id = :userId', { userId })
      .getMany();
  }

  async findOne(id: string): Promise<Trip> {
    const trip = await this.tripsRepository.findOne({
      where: { id },
      relations: ['creator', 'participants'],
    });

    if (!trip) {
      throw new NotFoundException(`Trip with ID "${id}" not found`);
    }

    return trip;
  }

  async findByTripCode(tripCode: string): Promise<Trip> {
    const trip = await this.tripsRepository.findOne({
      where: { tripCode },
      relations: ['creator', 'participants'],
    });

    if (!trip) {
      throw new NotFoundException(`Trip with code "${tripCode}" not found`);
    }

    return trip;
  }

  async create(createTripDto: CreateTripDto, user: User): Promise<Trip> {
    // Generate a unique trip code (6 characters)
    const tripCode = randomBytes(3).toString('hex').toUpperCase();

    // Create and save the trip
    const trip = this.tripsRepository.create({
      ...createTripDto,
      creatorId: user.id,
      creator: user,
      tripCode,
      participants: [user], // Creator is also a participant
    });

    return this.tripsRepository.save(trip);
  }

  async update(id: string, updateTripDto: UpdateTripDto, userId: string): Promise<Trip> {
    const trip = await this.findOne(id);

    // Only creator can update the trip
    if (trip.creatorId !== userId) {
      throw new ForbiddenException('You do not have permission to update this trip');
    }

    // Update trip
    Object.assign(trip, updateTripDto);
    return this.tripsRepository.save(trip);
  }

  async remove(id: string, userId: string): Promise<void> {
    const trip = await this.findOne(id);

    // Only creator can delete the trip
    if (trip.creatorId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this trip');
    }

    await this.tripsRepository.remove(trip);
  }

  async addParticipant(tripId: string, user: User): Promise<Trip> {
    const trip = await this.findOne(tripId);

    // Check if user is already a participant
    const isParticipant = trip.participants.some(p => p.id === user.id);
    if (!isParticipant) {
      trip.participants.push(user);
      await this.tripsRepository.save(trip);
      
      // Update any pending invitation status to accepted
      const pendingInvitation = await this.invitationsRepository.findOne({
        where: {
          tripId,
          email: user.email,
          status: InvitationStatus.PENDING
        }
      });
      
      if (pendingInvitation) {
        pendingInvitation.status = InvitationStatus.ACCEPTED;
        await this.invitationsRepository.save(pendingInvitation);
      }
    }

    return trip;
  }

  async removeParticipant(tripId: string, userId: string, currentUserId: string): Promise<void> {
    const trip = await this.findOne(tripId);

    // Only the trip creator or the participant themselves can remove a participant
    if (trip.creatorId !== currentUserId && userId !== currentUserId) {
      throw new ForbiddenException('You do not have permission to remove this participant');
    }

    // Cannot remove the creator
    if (userId === trip.creatorId) {
      throw new ForbiddenException('Cannot remove the trip creator');
    }

    // Remove participant
    trip.participants = trip.participants.filter(p => p.id !== userId);
    await this.tripsRepository.save(trip);
  }
} 