import { api } from './api';
import { Invitation } from '../types';

export interface CreateInvitationData {
  tripId: string;
  email: string;
}

export const invitationService = {
  // Get all invitations received by the current user
  async getReceivedInvitations(): Promise<Invitation[]> {
    return api.get<Invitation[]>('/invitations/received');
  },

  // Get all invitations sent by the current user
  async getSentInvitations(): Promise<Invitation[]> {
    return api.get<Invitation[]>('/invitations/sent');
  },

  // Send an invitation to a user
  async sendInvitation(data: CreateInvitationData): Promise<Invitation> {
    return api.post<Invitation>('/invitations', data);
  },

  // Accept an invitation
  async acceptInvitation(invitationId: string): Promise<void> {
    return api.put(`/invitations/${invitationId}/accept`);
  },

  // Reject an invitation
  async rejectInvitation(invitationId: string): Promise<void> {
    return api.put(`/invitations/${invitationId}/reject`);
  },

  // Cancel a sent invitation
  async cancelInvitation(invitationId: string): Promise<void> {
    return api.delete(`/invitations/${invitationId}`);
  }
}; 