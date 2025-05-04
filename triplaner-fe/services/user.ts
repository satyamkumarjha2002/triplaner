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
}

export const userService = new UserService(); 