import { Injectable } from '@nestjs/common';
import { TripsService } from '../trips/trips.service';
import { ActivitiesService } from '../activities/activities.service';
import { InvitationsService } from '../invitations/invitations.service';
import { User } from '../users/entities/user.entity';
import { Trip } from '../trips/entities/trip.entity';
import { Activity } from '../activities/entities/activity.entity';
import {
  Invitation,
  InvitationStatus,
} from '../invitations/entities/invitation.entity';

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

@Injectable()
export class DashboardService {
  constructor(
    private tripsService: TripsService,
    private activitiesService: ActivitiesService,
    private invitationsService: InvitationsService,
  ) {}

  async getDashboardData(user: User): Promise<DashboardData> {
    // Get all user trips
    const userTrips = await this.tripsService.findUserTrips(user.id);

    // Get all activities for user's trips
    const tripIds = userTrips.map((trip) => trip.id);
    const allActivities = await this.activitiesService.findByTripIds(tripIds);

    // Get pending invitations
    const invitations = await this.invitationsService.findUserInvitations(
      user.id,
    );
    const pendingInvitations = invitations.filter(
      (inv) => inv.status === InvitationStatus.PENDING,
    );

    // Calculate stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingTrips = userTrips.filter(
      (trip) => new Date(trip.startDate) >= today,
    );
    const upcomingActivities = allActivities.filter(
      (activity) => new Date(activity.date) >= today,
    );

    // Sort recent trips by start date (descending)
    const recentTrips = [...userTrips]
      .sort(
        (a, b) =>
          new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
      )
      .slice(0, 6); // Get at most 6 recent trips

    // Sort upcoming activities by date (ascending)
    const sortedUpcomingActivities = [...upcomingActivities]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 10); // Get at most 10 upcoming activities

    return {
      stats: {
        totalTrips: userTrips.length,
        upcomingTrips: upcomingTrips.length,
        totalActivities: allActivities.length,
        pendingInvitations: pendingInvitations.length,
      },
      recentTrips,
      upcomingActivities: sortedUpcomingActivities,
    };
  }
}
