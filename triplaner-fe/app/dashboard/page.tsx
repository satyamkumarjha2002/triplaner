'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  CalendarIcon, 
  PlusIcon, 
  LuggageIcon, 
  MapIcon, 
  TicketIcon,
  MailOpenIcon,
  ArrowRightIcon
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { TripCard } from '@/components/trips/TripCard';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { dashboardService, DashboardData } from '@/services/dashboard';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await dashboardService.getDashboardData();
        setDashboardData(data);
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <p className="text-red-500 mb-4">{error || 'Something went wrong'}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  const { stats, recentTrips, upcomingActivities } = dashboardData;

  // Get upcoming trip if available
  const upcomingTrip = recentTrips.find(trip => new Date(trip.startDate) > new Date());

  // Function to get color for activity category
  const getCategoryColor = (category: string) => {
    switch(category) {
      case 'Food': return 'bg-orange-400';
      case 'Adventure': return 'bg-blue-500';
      case 'Sightseeing': return 'bg-green-500';
      case 'Other': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="container py-6 md:py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 md:mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Welcome Back!</h1>
              <p className="text-muted-foreground mt-1">
                Here's an overview of your trips and upcoming activities.
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 space-x-2">
              <Button asChild variant="outline">
                <Link href="/trips">
                  View All Trips
                </Link>
              </Button>
              <Button asChild>
                <Link href="/trips/new">
                  <PlusIcon className="mr-2 h-4 w-4" />
                  New Trip
                </Link>
              </Button>
            </div>
          </div>
          
          <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6 md:mb-8">
            <Card className="overflow-hidden border-blue-100 dark:border-blue-900/30">
              <div className="h-1 bg-blue-500" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Trips</CardTitle>
                <LuggageIcon className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalTrips}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.upcomingTrips} upcoming
                </p>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden border-green-100 dark:border-green-900/30">
              <div className="h-1 bg-green-500" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Trips</CardTitle>
                <CalendarIcon className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.upcomingTrips}</div>
                {upcomingTrip && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Next: {new Date(upcomingTrip.startDate).toLocaleDateString()}
                  </p>
                )}
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden border-amber-100 dark:border-amber-900/30">
              <div className="h-1 bg-amber-500" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
                <TicketIcon className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalActivities}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {upcomingActivities.length} upcoming
                </p>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden border-purple-100 dark:border-purple-900/30">
              <div className="h-1 bg-purple-500" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Invitations</CardTitle>
                <MailOpenIcon className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingInvitations}</div>
                {stats.pendingInvitations > 0 && (
                  <Link href="/invitations" className="text-xs text-purple-600 dark:text-purple-400 mt-1 inline-block hover:underline">
                    View invitations
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue="trips" className="mb-8">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="trips">Recent Trips</TabsTrigger>
              <TabsTrigger value="activities">Upcoming Activities</TabsTrigger>
            </TabsList>
            
            <TabsContent value="trips">
              {recentTrips.length > 0 ? (
                <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {recentTrips.map((trip) => (
                    <TripCard key={trip.id} trip={trip} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-muted/20 rounded-lg">
                  <LuggageIcon className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No trips yet</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">Create your first trip to start planning your adventure!</p>
                  <Button asChild size="lg">
                    <Link href="/trips/new">Create Your First Trip</Link>
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="activities">
              {upcomingActivities.length > 0 ? (
                <div className="space-y-6">
                  {upcomingActivities.map((activity) => (
                    <Card key={activity.id} className="overflow-hidden border border-muted">
                      <div className={cn("h-1", getCategoryColor(activity.category))} />
                      <CardHeader>
                        <div className="flex justify-between">
                          <CardTitle className="text-lg">{activity.title}</CardTitle>
                          <Link href={`/trips/${activity.tripId}`} className="text-xs text-muted-foreground hover:text-primary">
                            View Trip
                          </Link>
                        </div>
                        <CardDescription>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="flex items-center">
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {new Date(activity.date).toLocaleDateString()} 
                              {activity.time && ` at ${activity.time}`}
                            </span>
                            <div className="flex items-center">
                              <MapIcon className="mr-2 h-4 w-4" />
                              <span>{activity.category}</span>
                            </div>
                          </div>
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {activity.notes && (
                          <p className="text-sm text-muted-foreground">{activity.notes}</p>
                        )}
                        {activity.estimatedCost !== undefined && (
                          <div className="mt-4 flex items-center">
                            <div className="text-sm font-semibold">
                              ${activity.estimatedCost}
                            </div>
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="flex justify-end">
                        <Button asChild variant="ghost" size="sm" className="gap-1">
                          <Link href={`/trips/${activity.tripId}`}>
                            View Details <ArrowRightIcon className="h-3 w-3" />
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-muted/20 rounded-lg">
                  <TicketIcon className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No upcoming activities</h3>
                  <p className="text-muted-foreground mb-4">Start planning activities for your trips!</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 