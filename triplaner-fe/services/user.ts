import { api } from './api';
import { User } from '@/types';

interface ProfileUpdateData {
  username?: string;
  email?: string;
  name?: string;
}

class UserService {
  async getProfile(): Promise<User> {
    return api.get<User>('/users/profile');
  }

  async updateProfile(data: ProfileUpdateData): Promise<User> {
    return api.put<User>('/users/profile', data);
  }

  async updatePassword(currentPassword: string, newPassword: string): Promise<void> {
    return api.put<void>('/users/password', {
      currentPassword,
      newPassword
    });
  }

  async searchUsers(query: string): Promise<User[]> {
    if (!query || query.trim() === '') {
      return [];
    }
    
    try {
      return await api.get<User[]>(`/users/search`, { query });
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  }

  // Get all users for invitations (limited to a reasonable number)
  async getAllUsers(): Promise<User[]> {
    try {
      return await api.get<User[]>('/users');
    } catch (error) {
      console.error('Error fetching all users:', error);
      return [];
    }
  }
}

export const userService = new UserService(); 