import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vote } from './entities/vote.entity';
import { Activity } from './entities/activity.entity';
import { CreateVoteDto } from './dto/create-vote.dto';
import { User } from '../users/entities/user.entity';
import { ActivitiesService } from './activities.service';

@Injectable()
export class VotesService {
  constructor(
    @InjectRepository(Vote)
    private votesRepository: Repository<Vote>,

    @InjectRepository(Activity)
    private activitiesRepository: Repository<Activity>,

    private activitiesService: ActivitiesService,
  ) {}

  async createVote(
    tripId: string,
    activityId: string,
    createVoteDto: CreateVoteDto,
    user: User,
  ): Promise<Activity> {
    // Check if user has access to the activity
    await this.activitiesService.findOne(tripId, activityId, user.id);

    // Check if user already voted on this activity
    const existingVote = await this.votesRepository.findOne({
      where: { activityId, userId: user.id },
    });

    if (existingVote) {
      // Update the vote if it exists
      existingVote.isUpvote = createVoteDto.isUpvote;
      await this.votesRepository.save(existingVote);
    } else {
      // Create a new vote
      const vote = this.votesRepository.create({
        activityId,
        userId: user.id,
        isUpvote: createVoteDto.isUpvote,
      });

      await this.votesRepository.save(vote);
    }

    // Return the updated activity with votes
    return this.activitiesService.findOne(tripId, activityId, user.id);
  }

  async removeVote(
    tripId: string,
    activityId: string,
    userId: string,
  ): Promise<Activity> {
    // Check if user has access to the activity
    await this.activitiesService.findOne(tripId, activityId, userId);

    // Find the user's vote
    const vote = await this.votesRepository.findOne({
      where: { activityId, userId },
    });

    if (!vote) {
      throw new NotFoundException('Vote not found');
    }

    // Remove the vote
    await this.votesRepository.remove(vote);

    // Return the updated activity with votes
    return this.activitiesService.findOne(tripId, activityId, userId);
  }
}
