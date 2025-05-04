import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invitation, InvitationStatus } from './entities/invitation.entity';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { User } from '../users/entities/user.entity';
import { TripsService } from '../trips/trips.service';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class InvitationsService {
  private readonly logger = new Logger(InvitationsService.name);

  constructor(
    @InjectRepository(Invitation)
    private invitationsRepository: Repository<Invitation>,
    private tripsService: TripsService,
    private usersService: UsersService,
    private emailService: EmailService,
  ) {}

  async findUserInvitations(userId: string): Promise<Invitation[]> {
    const user = await this.usersService.findOne(userId);

    return this.invitationsRepository.find({
      where: { email: user.email },
      relations: ['trip', 'trip.creator'],
    });
  }

  async findTripInvitations(
    tripId: string,
    userId: string,
  ): Promise<Invitation[]> {
    // Check if user is the trip creator
    const trip = await this.tripsService.findOne(tripId);

    if (trip.creatorId !== userId) {
      throw new ForbiddenException(
        'Only the trip creator can view invitations',
      );
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

  async create(
    tripId: string,
    createInvitationDto: CreateInvitationDto,
    user: User,
  ): Promise<Invitation> {
    this.logger.log(
      `Creating invitation for trip ${tripId} to ${createInvitationDto.email} from user ${user.id}`,
    );

    // Check if user is the trip creator or a participant
    const trip = await this.tripsService.findOne(tripId);
    const isParticipant = trip.participants.some((p) => p.id === user.id);

    if (!isParticipant) {
      this.logger.error(
        `User ${user.id} is not a participant in trip ${tripId}`,
      );
      throw new ForbiddenException(
        'Only trip participants can send invitations',
      );
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
      this.logger.warn(
        `Email ${createInvitationDto.email} already has a pending invitation for trip ${tripId}`,
      );
      throw new ConflictException(
        'This email has already been invited to the trip',
      );
    }

    // Check if the user is inviting themselves
    if (createInvitationDto.email === user.email) {
      this.logger.warn(
        `User ${user.id} tried to invite themselves to trip ${tripId}`,
      );
      throw new ConflictException('You cannot invite yourself to the trip');
    }

    // Check if user to invite is already a participant
    const invitedUser = await this.usersService.findByEmail(
      createInvitationDto.email,
    );
    if (invitedUser) {
      const isAlreadyParticipant = trip.participants.some(
        (p) => p.id === invitedUser.id,
      );
      if (isAlreadyParticipant) {
        this.logger.warn(
          `User with email ${createInvitationDto.email} is already a participant in trip ${tripId}`,
        );
        throw new ConflictException(
          'This user is already a participant in the trip',
        );
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

    // Send invitation email
    try {
      const inviterName = user.name || user.username;

      // Convert dates to strings properly, handling both Date objects and string dates
      const startDateString =
        typeof trip.startDate === 'string'
          ? trip.startDate
          : trip.startDate instanceof Date
            ? trip.startDate.toISOString()
            : new Date(trip.startDate).toISOString();

      const endDateString =
        typeof trip.endDate === 'string'
          ? trip.endDate
          : trip.endDate instanceof Date
            ? trip.endDate.toISOString()
            : new Date(trip.endDate).toISOString();

      await this.emailService.sendTripInvitation(
        createInvitationDto.email,
        inviterName,
        trip.name,
        startDateString,
        endDateString,
      );
      this.logger.log(`Invitation email sent to ${createInvitationDto.email}`);
    } catch (error) {
      this.logger.error(`Failed to send invitation email: ${error.message}`);
      // We don't throw here to avoid disrupting the flow if email fails
    }

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
    if (!user) {
      this.logger.warn(`User with email ${userEmail} not found`);
      return;
    }

    await this.tripsService.addParticipant(invitation.tripId, user);

    // Get the trip details
    const trip = await this.tripsService.findOne(invitation.tripId);

    // Notify all trip participants
    try {
      // Collect participant emails, excluding the user who accepted
      const participantEmails = trip.participants
        .filter((p) => p.email !== userEmail)
        .map((p) => p.email);

      if (participantEmails.length > 0) {
        const userName = user.name || user.username;
        await this.emailService.sendInvitationAcceptedNotification(
          participantEmails,
          userName,
          trip.name,
          trip.id,
        );
        this.logger.log(
          `Acceptance notification emails sent to trip participants`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to send acceptance notification emails: ${error.message}`,
      );
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

    this.logger.log(
      `User ${userEmail} declined invitation ${id}${reason ? ` with reason: ${reason}` : ''}`,
    );
    await this.invitationsRepository.save(invitation);

    // Get user info for the email notification
    const user = await this.usersService.findByEmail(userEmail);
    if (!user) {
      this.logger.warn(
        `User with email ${userEmail} not found for decline notification`,
      );
      return;
    }

    // Get the trip details
    const trip = await this.tripsService.findOne(invitation.tripId);

    // Notify trip creator and other participants
    try {
      // Collect participant emails, excluding the user who declined
      const participantEmails = trip.participants.map((p) => p.email);

      if (participantEmails.length > 0) {
        const userName = user.name || user.username;
        await this.emailService.sendInvitationDeclinedNotification(
          participantEmails,
          userName,
          trip.name,
          trip.id,
          reason,
        );
        this.logger.log(
          `Decline notification emails sent to trip participants`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to send decline notification emails: ${error.message}`,
      );
    }
  }
}
