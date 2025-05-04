import { Injectable, NotFoundException, ForbiddenException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invitation, InvitationStatus } from './entities/invitation.entity';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { User } from '../users/entities/user.entity';
import { TripsService } from '../trips/trips.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class InvitationsService {
  private readonly logger = new Logger(InvitationsService.name);

  constructor(
    @InjectRepository(Invitation)
    private invitationsRepository: Repository<Invitation>,
    private tripsService: TripsService,
    private usersService: UsersService,
  ) {}

  async findUserInvitations(userId: string): Promise<Invitation[]> {
    const user = await this.usersService.findOne(userId);
    
    return this.invitationsRepository.find({
      where: { email: user.email },
      relations: ['trip', 'trip.creator'],
    });
  }

  async findTripInvitations(tripId: string, userId: string): Promise<Invitation[]> {
    // Check if user is the trip creator
    const trip = await this.tripsService.findOne(tripId);
    
    if (trip.creatorId !== userId) {
      throw new ForbiddenException('Only the trip creator can view invitations');
    }
    
    return this.invitationsRepository.find({
      where: { tripId },
      relations: ['sender'],
    });
  }

  async findOne(id: string): Promise<Invitation> {
    const invitation = await this.invitationsRepository.findOne({
      where: { id },
      relations: ['trip', 'sender'],
    });
    
    if (!invitation) {
      throw new NotFoundException(`Invitation with ID "${id}" not found`);
    }
    
    return invitation;
  }

  async create(tripId: string, createInvitationDto: CreateInvitationDto, user: User): Promise<Invitation> {
    this.logger.log(`Creating invitation for trip ${tripId} to ${createInvitationDto.email} from user ${user.id}`);
    
    // Check if user is the trip creator or a participant
    const trip = await this.tripsService.findOne(tripId);
    const isParticipant = trip.participants.some(p => p.id === user.id);
    
    if (!isParticipant) {
      this.logger.error(`User ${user.id} is not a participant in trip ${tripId}`);
      throw new ForbiddenException('Only trip participants can send invitations');
    }
    
    // Check if email is already invited
    const existingInvitation = await this.invitationsRepository.findOne({
      where: { 
        tripId,
        email: createInvitationDto.email,
        status: InvitationStatus.PENDING,
      },
    });
    
    if (existingInvitation) {
      this.logger.warn(`Email ${createInvitationDto.email} already has a pending invitation for trip ${tripId}`);
      throw new ConflictException('This email has already been invited to the trip');
    }
    
    // Check if the user is inviting themselves
    if (createInvitationDto.email === user.email) {
      this.logger.warn(`User ${user.id} tried to invite themselves to trip ${tripId}`);
      throw new ConflictException('You cannot invite yourself to the trip');
    }
    
    // Check if user to invite is already a participant
    const invitedUser = await this.usersService.findByEmail(createInvitationDto.email);
    if (invitedUser) {
      const isAlreadyParticipant = trip.participants.some(p => p.id === invitedUser.id);
      if (isAlreadyParticipant) {
        this.logger.warn(`User with email ${createInvitationDto.email} is already a participant in trip ${tripId}`);
        throw new ConflictException('This user is already a participant in the trip');
      }
    }
    
    // Create and save the invitation
    const invitation = this.invitationsRepository.create({
      tripId,
      email: createInvitationDto.email,
      status: InvitationStatus.PENDING,
      senderId: user.id,
    });
    
    const savedInvitation = await this.invitationsRepository.save(invitation);
    this.logger.log(`Invitation created with ID ${savedInvitation.id}`);
    
    return savedInvitation;
  }

  async accept(id: string, userEmail: string): Promise<void> {
    const invitation = await this.findOne(id);
    
    // Check if the invitation belongs to the user
    if (invitation.email !== userEmail) {
      throw new ForbiddenException('This invitation is not for you');
    }
    
    // Check if the invitation is pending
    if (invitation.status !== InvitationStatus.PENDING) {
      throw new ConflictException('This invitation has already been processed');
    }
    
    // Update invitation status
    invitation.status = InvitationStatus.ACCEPTED;
    await this.invitationsRepository.save(invitation);
    
    // Add user to trip participants
    const user = await this.usersService.findByEmail(userEmail);
    if (user) {
      await this.tripsService.addParticipant(invitation.tripId, user);
    }
  }

  async decline(id: string, userEmail: string, reason?: string): Promise<void> {
    const invitation = await this.findOne(id);
    
    // Check if the invitation belongs to the user
    if (invitation.email !== userEmail) {
      throw new ForbiddenException('This invitation is not for you');
    }
    
    // Check if the invitation is pending
    if (invitation.status !== InvitationStatus.PENDING) {
      throw new ConflictException('This invitation has already been processed');
    }
    
    // Update invitation status and reason
    invitation.status = InvitationStatus.DECLINED;
    if (reason) {
      invitation.declineReason = reason;
    }
    
    this.logger.log(`User ${userEmail} declined invitation ${id}${reason ? ` with reason: ${reason}` : ''}`);
    await this.invitationsRepository.save(invitation);
  }
} 