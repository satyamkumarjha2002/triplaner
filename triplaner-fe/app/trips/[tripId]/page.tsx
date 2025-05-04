'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { 
  PlusIcon, 
  UsersIcon, 
  CalendarIcon, 
  WalletIcon,
  PencilIcon,
  TrashIcon,
  CopyIcon,
  UserPlusIcon,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { tripService } from '@/services/trips';
import { activityService } from '@/services/activities';
import { Trip, Activity } from '@/types';
import { useModal } from '@/context/ModalContext';
import { toast } from '@/components/ui/use-toast';

interface TripDetailPageProps {
  params: {
    tripId: string;
  };
}

export default function TripDetailPage({ params }: TripDetailPageProps) {
  const router = useRouter();
  const { tripId } = params;
  const { openModal } = useModal();
  
  const [isLoading, setIsLoading] = useState(true);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const fetchTripData = async () => {
    try {
      const [tripData, activitiesData] = await Promise.all([
        tripService.getTripById(tripId),
        activityService.getTripActivities(tripId)
      ]);
      
      setTrip(tripData);
      setActivities(activitiesData);
    } catch (err) {
      console.error('Failed to fetch trip data', err);
      setError('Failed to load trip details. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTripData();
  }, [tripId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading trip details...</p>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <p className="text-red-500 mb-4">{error || 'Trip not found'}</p>
        <Button asChild>
          <Link href="/trips">Back to Trips</Link>
        </Button>
      </div>
    );
  }

  const startDate = new Date(trip.startDate);
  const endDate = new Date(trip.endDate);
  
  const formattedStartDate = format(startDate, 'MMM d, yyyy');
  const formattedEndDate = format(endDate, 'MMM d, yyyy');
  
  const activitiesByDate = activities.reduce((acc, activity) => {
    const date = new Date(activity.date).toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(activity);
    return acc;
  }, {} as Record<string, Activity[]>);
  
  const sortedDates = Object.keys(activitiesByDate).sort();

  const copyTripCode = () => {
    navigator.clipboard.writeText(trip.tripCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    toast({
      title: "Trip code copied!",
      description: "The trip code has been copied to your clipboard",
    });
  };
  
  const handleInviteFriends = () => {
    if (trip) {
      openModal('inviteFriend', {
        tripId: trip.id,
        tripName: trip.name
      });
    }
  };

  const handleEditTrip = () => {
    if (trip) {
      openModal('editTrip', {
        trip: trip,
        onSuccess: () => {
          fetchTripData();
          toast({
            title: "Trip updated",
            description: "Your trip has been updated successfully",
          });
        }
      });
    }
  };

  const handleAddActivity = () => {
    openModal('addActivity', {
      tripId: tripId,
      onSuccess: () => {
        fetchTripData();
        toast({
          title: "Activity added",
          description: "Your activity has been added successfully",
        });
      }
    });
  };

  // Function to handle voting on an activity
  const handleVote = async (activityId: string, isUpvote: boolean) => {
    try {
      const updatedActivity = await activityService.voteActivity(tripId, activityId, isUpvote);
      
      // Update the activity in the state
      setActivities(currentActivities => 
        currentActivities.map(activity => 
          activity.id === updatedActivity.id ? updatedActivity : activity
        )
      );
      
      toast({
        title: isUpvote ? "Voted up!" : "Voted down!",
        description: `You've ${isUpvote ? 'upvoted' : 'downvoted'} this activity.`
      });
    } catch (err) {
      console.error('Failed to vote on activity:', err);
      toast({
        title: "Error",
        description: "Failed to register your vote. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Function to remove a vote from an activity
  const handleRemoveVote = async (activityId: string) => {
    try {
      const updatedActivity = await activityService.removeVote(tripId, activityId);
      
      // Update the activity in the state
      setActivities(currentActivities => 
        currentActivities.map(activity => 
          activity.id === updatedActivity.id ? updatedActivity : activity
        )
      );
      
      toast({
        title: "Vote removed",
        description: "You've removed your vote from this activity."
      });
    } catch (err) {
      console.error('Failed to remove vote:', err);
      toast({
        title: "Error",
        description: "Failed to remove your vote. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Helper function to check if current user has voted on an activity
  const getUserVote = (votes: any[]) => {
    // For demo purposes, using a fixed user ID
    const currentUserId = '1'; // In a real app, this would come from authentication
    const userVote = votes.find(vote => vote.userId === currentUserId);
    return userVote ? (userVote.isUpvote ? 'up' : 'down') : null;
  };

  // Helper function to count votes
  const countVotes = (votes: any[]) => {
    const upvotes = votes.filter(vote => vote.isUpvote).length;
    const downvotes = votes.filter(vote => !vote.isUpvote).length;
    return { upvotes, downvotes, total: upvotes - downvotes };
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 container py-8">
        <div className="flex flex-col md:flex-row justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">{trip.name}</h1>
            </div>
            <div className="flex flex-wrap gap-4 mt-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <CalendarIcon className="mr-1 h-4 w-4" />
                <span>{formattedStartDate} to {formattedEndDate}</span>
              </div>
              
              <div className="flex items-center text-sm text-muted-foreground">
                <UsersIcon className="mr-1 h-4 w-4" />
                <span>{trip.participants.length} participants</span>
              </div>
              
              {trip.budget && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <WalletIcon className="mr-1 h-4 w-4" />
                  <span>Budget: ${trip.budget}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex mt-4 md:mt-0 gap-2">
            <Button 
              variant="outline" 
              onClick={handleEditTrip}
            >
              <PencilIcon className="mr-2 h-4 w-4" />
              Edit Trip
            </Button>
            
            <Button variant="destructive" size="icon">
              <TrashIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4 mb-8">
          <div className="md:col-span-2 lg:col-span-3 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Trip Itinerary</CardTitle>
                <CardDescription>
                  Activities planned for this trip
                </CardDescription>
              </CardHeader>
              <CardContent>
                {activities.length > 0 ? (
                  <div className="space-y-8">
                    {sortedDates.map(date => (
                      <div key={date}>
                        <h3 className="font-medium mb-4">
                          {format(new Date(date), 'EEEE, MMMM d, yyyy')}
                        </h3>
                        <div className="space-y-4">
                          {activitiesByDate[date]
                            .sort((a, b) => (a.time || '').localeCompare(b.time || ''))
                            .map(activity => {
                              const userVote = getUserVote(activity.votes);
                              const { upvotes, downvotes, total } = countVotes(activity.votes);
                              
                              return (
                                <Card key={activity.id} className="overflow-hidden">
                                  <div className="flex">
                                    <div className={`w-2 ${
                                      activity.category === 'Adventure' ? 'bg-blue-500' :
                                      activity.category === 'Food' ? 'bg-green-500' :
                                      activity.category === 'Sightseeing' ? 'bg-purple-500' :
                                      'bg-gray-500'
                                    }`} />
                                    <div className="p-4 w-full">
                                      <div className="flex justify-between">
                                        <h4 className="font-medium">{activity.title}</h4>
                                        <Badge variant="outline">{activity.category}</Badge>
                                      </div>
                                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                                        {activity.time && (
                                          <span className="mr-4">{activity.time}</span>
                                        )}
                                        {activity.estimatedCost !== undefined && (
                                          <span className="mr-4">${activity.estimatedCost}</span>
                                        )}
                                        <div className="flex items-center gap-1">
                                          <span className={`font-medium ${total >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {total > 0 ? `+${total}` : total}
                                          </span>
                                          <span className="text-muted-foreground">votes</span>
                                        </div>
                                      </div>
                                      {activity.notes && (
                                        <p className="mt-2 text-sm">{activity.notes}</p>
                                      )}
                                      
                                      {/* Voting UI */}
                                      <div className="mt-3 flex items-center gap-2">
                                        <Button 
                                          variant={userVote === 'up' ? 'default' : 'outline'} 
                                          size="sm"
                                          className={`h-8 ${userVote === 'up' ? 'bg-green-500 hover:bg-green-600' : ''}`}
                                          onClick={() => userVote === 'up' 
                                            ? handleRemoveVote(activity.id) 
                                            : handleVote(activity.id, true)
                                          }
                                        >
                                          <ThumbsUp className="h-4 w-4 mr-1" />
                                          <span>{upvotes}</span>
                                        </Button>
                                        <Button 
                                          variant={userVote === 'down' ? 'default' : 'outline'} 
                                          size="sm"
                                          className={`h-8 ${userVote === 'down' ? 'bg-red-500 hover:bg-red-600' : ''}`}
                                          onClick={() => userVote === 'down' 
                                            ? handleRemoveVote(activity.id) 
                                            : handleVote(activity.id, false)
                                          }
                                        >
                                          <ThumbsDown className="h-4 w-4 mr-1" />
                                          <span>{downvotes}</span>
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </Card>
                              );
                            })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">No activities planned yet</p>
                    <Button onClick={handleAddActivity}>
                      <PlusIcon className="mr-2 h-4 w-4" />
                      Add Activity
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Collaboration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-1">Trip Code</p>
                  <div className="flex gap-2">
                    <code className="flex-1 bg-muted px-2 py-1 rounded text-sm">{trip.tripCode}</code>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8" 
                      onClick={copyTripCode}
                    >
                      <CopyIcon className="h-4 w-4" />
                    </Button>
                  </div>
                  {isCopied && (
                    <p className="text-xs text-green-600 mt-1">Copied to clipboard!</p>
                  )}
                </div>
                
                <Separator />
                
                <div>
                  <p className="text-sm font-medium mb-2">Participants</p>
                  <ul className="space-y-2">
                    {trip.participants.map(participant => (
                      <li key={participant.id} className="flex items-center text-sm">
                        <span className="bg-primary text-primary-foreground h-6 w-6 rounded-full flex items-center justify-center text-xs mr-2">
                          {participant.username.substring(0, 2).toUpperCase()}
                        </span>
                        <span>{participant.username}</span>
                        {participant.id === trip.creatorId && (
                          <Badge className="ml-2" variant="outline">Creator</Badge>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <Button 
                  className="w-full" 
                  onClick={handleInviteFriends}
                >
                  <UserPlusIcon className="mr-2 h-4 w-4" />
                  Invite Friends
                </Button>
              </CardContent>
            </Card>
            
            <Button onClick={handleAddActivity} className="w-full">
              <PlusIcon className="mr-2 h-4 w-4" />
              Add Activity
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 