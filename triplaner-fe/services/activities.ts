import { api } from './api';
import { Activity } from '../types';

export interface CreateActivityData {
  title: string;
  date: string;
  time?: string;
  category: string;
  estimatedCost?: number;
  notes?: string;
}

export const activityService = {
  // Get all activities for a trip
  async getTripActivities(tripId: string): Promise<Activity[]> {
    return api.get<Activity[]>(`/trips/${tripId}/activities`);
  },

  // Get a single activity by ID
  async getActivityById(tripId: string, activityId: string): Promise<Activity> {
    return api.get<Activity>(`/trips/${tripId}/activities/${activityId}`);
  },

  // Create a new activity for a trip
  async createActivity(tripId: string, activityData: CreateActivityData): Promise<Activity> {
    return api.post<Activity>(`/trips/${tripId}/activities`, activityData);
  },

  // Update an activity
  async updateActivity(tripId: string, activityId: string, activityData: Partial<CreateActivityData>): Promise<Activity> {
    return api.put<Activity>(`/trips/${tripId}/activities/${activityId}`, activityData);
  },

  // Delete an activity
  async deleteActivity(tripId: string, activityId: string): Promise<void> {
    return api.delete(`/trips/${tripId}/activities/${activityId}`);
  },

  // Vote on an activity
  async voteActivity(tripId: string, activityId: string, isUpvote: boolean): Promise<Activity> {
    return api.post<Activity>(`/trips/${tripId}/activities/${activityId}/vote`, { isUpvote });
  },

  // Remove vote from an activity
  async removeVote(tripId: string, activityId: string): Promise<Activity> {
    return api.delete<Activity>(`/trips/${tripId}/activities/${activityId}/vote`);
  }
}; 