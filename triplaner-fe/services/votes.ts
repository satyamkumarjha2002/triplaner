import { api } from './api';
import { Vote, Activity } from '../types';

export interface VoteData {
  activityId: string;
  tripId: string;
  isUpvote: boolean;
}

export const voteService = {
  // Get all votes for an activity
  async getActivityVotes(tripId: string, activityId: string): Promise<Vote[]> {
    return api.get<Vote[]>(`/trips/${tripId}/activities/${activityId}/votes`);
  },

  // Add vote to an activity
  async addVote(data: VoteData): Promise<Activity> {
    return api.post<Activity>(`/trips/${data.tripId}/activities/${data.activityId}/vote`, { isUpvote: data.isUpvote });
  },

  // Remove vote from an activity
  async removeVote(tripId: string, activityId: string): Promise<Activity> {
    return api.delete<Activity>(`/trips/${tripId}/activities/${activityId}/vote`);
  },

  // Get all user votes
  async getUserVotes(): Promise<Vote[]> {
    return api.get<Vote[]>('/votes');
  }
}; 