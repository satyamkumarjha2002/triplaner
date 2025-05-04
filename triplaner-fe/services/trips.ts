import { api } from './api';
import { Trip, Invitation } from '../types';

export interface CreateTripData {
  name: string;
  startDate: string;
  endDate: string;
  budget?: number;
}

export interface InviteUserData {
  tripId: string;
  email: string;
}

export const tripService = {
  // Get all trips for the current user
  async getUserTrips(): Promise<Trip[]> {
    return api.get<Trip[]>('/trips');
  },

  // Get a single trip by ID
  async getTripById(tripId: string): Promise<Trip> {
    return api.get<Trip>(`/trips/${tripId}`);
  },

  // Create a new trip
  async createTrip(tripData: CreateTripData): Promise<Trip> {
    return api.post<Trip>('/trips', tripData);
  },

  // Update a trip
  async updateTrip(tripId: string, tripData: Partial<CreateTripData>): Promise<Trip> {
    return api.put<Trip>(`/trips/${tripId}`, tripData);
  },

  // Delete a trip
  async deleteTrip(tripId: string): Promise<void> {
    return api.delete(`/trips/${tripId}`);
  },

  // Invite a user to a trip
  async inviteUser(inviteData: InviteUserData): Promise<Invitation> {
    console.log(`Sending invitation: Trip ID ${inviteData.tripId} to ${inviteData.email}`);
    try {
      const result = await api.post<Invitation>(`/trips/${inviteData.tripId}/invitations`, { 
        email: inviteData.email 
      });
      console.log('Invitation sent successfully:', result);
      return result;
    } catch (error) {
      console.error('Error sending invitation:', error);
      throw error;
    }
  },

  // Join a trip via trip code
  async joinTripByCode(tripCode: string): Promise<Trip> {
    return api.post<Trip>('/trips/join', { tripCode });
  },

  // Get all invitations for current user
  async getUserInvitations(): Promise<Invitation[]> {
    return api.get<Invitation[]>('/invitations');
  },
  
  // Accept an invitation
  async acceptInvitation(invitationId: string): Promise<void> {
    return api.put(`/invitations/${invitationId}/accept`);
  },
  
  // Reject an invitation
  async rejectInvitation(invitationId: string): Promise<void> {
    return api.put(`/invitations/${invitationId}/reject`);
  },

  // Decline an invitation
  async declineInvitation(invitationId: string): Promise<void> {
    return api.put(`/invitations/${invitationId}/decline`);
  }
}; 