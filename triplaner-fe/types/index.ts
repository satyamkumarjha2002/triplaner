export interface User {
  id: string;
  username: string;
  email: string;
  name?: string;
}

export interface Trip {
  id: string;
  name: string;
  startDate: Date | string;
  endDate: Date | string;
  budget?: number;
  creatorId: string;
  creator?: User;
  tripCode: string;
  participants: User[];
}

export interface Activity {
  id: string;
  title: string;
  date: Date | string;
  time?: string;
  category: 'Adventure' | 'Food' | 'Sightseeing' | 'Other';
  estimatedCost?: number;
  notes?: string;
  tripId: string;
  creatorId: string;
  votes: Vote[];
}

export interface Vote {
  id: string;
  userId: string;
  activityId: string;
  isUpvote: boolean;
}

export interface Invitation {
  id: string;
  tripId: string;
  email: string;
  status: 'pending' | 'accepted' | 'declined';
  trip?: Trip;
  sender?: User;
}

export type AuthState = {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  hasPendingInvitations: boolean;
}; 