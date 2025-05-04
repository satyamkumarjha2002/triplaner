import { Trip, Activity } from '@/types';
import { api } from './api';

export interface DashboardStats {
  totalTrips: number;
  upcomingTrips: number;
  totalActivities: number;
  pendingInvitations: number;
}

export interface DashboardData {
  stats: DashboardStats;
  recentTrips: Trip[];
  upcomingActivities: Activity[];
}

export const dashboardService = {
  // Get dashboard data for a user
  async getDashboardData(): Promise<DashboardData> {
    try {
      return api.get<DashboardData>('/dashboard');
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  }
}; 