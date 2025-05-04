'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PlusIcon, SearchIcon, FilterIcon, ArrowDownIcon, ArrowUpIcon, CalendarIcon, LuggageIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { TripCard } from '@/components/trips/TripCard';
import { tripService } from '@/services/trips';
import { Trip } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

type SortOption = 'name' | 'date' | 'participants';
type SortOrder = 'asc' | 'desc';

export default function TripsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  
  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const data = await tripService.getUserTrips();
        setTrips(data);
      } catch (err) {
        console.error('Failed to fetch trips', err);
        setError('Failed to load trips. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrips();
  }, []);
  
  // Filter trips based on search term
  const filteredTrips = trips.filter(trip => 
    trip.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Separate trips by status
  const today = new Date();
  const upcomingTrips = filteredTrips.filter(trip => new Date(trip.startDate) > today);
  const ongoingTrips = filteredTrips.filter(trip => 
    new Date(trip.startDate) <= today && new Date(trip.endDate) >= today
  );
  const pastTrips = filteredTrips.filter(trip => new Date(trip.endDate) < today);
  
  // Sort trips
  const sortTrips = (tripsToSort: Trip[]) => {
    return [...tripsToSort].sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'date') {
        comparison = new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      } else if (sortBy === 'participants') {
        comparison = a.participants.length - b.participants.length;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  };
  
  const sortedUpcomingTrips = sortTrips(upcomingTrips);
  const sortedOngoingTrips = sortTrips(ongoingTrips);
  const sortedPastTrips = sortTrips(pastTrips);

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="container py-6 md:py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 md:mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-1">My Trips</h1>
              <p className="text-muted-foreground">
                Manage all your trips in one place
              </p>
            </div>
            
            <div className="mt-4 md:mt-0">
              <Button asChild>
                <Link href="/trips/new">
                  <PlusIcon className="mr-2 h-4 w-4" />
                  New Trip
                </Link>
              </Button>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-4 md:mb-6">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search trips..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <div className="w-40">
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                  <SelectTrigger>
                    <div className="flex items-center gap-2">
                      <FilterIcon className="h-4 w-4" />
                      <SelectValue placeholder="Sort by" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="participants">Participants</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" size="icon" onClick={toggleSortOrder}>
                {sortOrder === 'asc' ? (
                  <ArrowUpIcon className="h-4 w-4" />
                ) : (
                  <ArrowDownIcon className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-2">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-muted-foreground">Loading your trips...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
          ) : filteredTrips.length > 0 ? (
            <Tabs defaultValue={ongoingTrips.length ? "ongoing" : "upcoming"} className="mb-8">
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="ongoing" className="relative">
                  Ongoing
                  {ongoingTrips.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                      {ongoingTrips.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="upcoming" className="relative">
                  Upcoming
                  {upcomingTrips.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                      {upcomingTrips.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="past">Past</TabsTrigger>
              </TabsList>
              
              <TabsContent value="ongoing">
                {sortedOngoingTrips.length > 0 ? (
                  <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {sortedOngoingTrips.map((trip) => (
                      <TripCard key={trip.id} trip={trip} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-muted/20 rounded-lg">
                    <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No ongoing trips</h3>
                    <p className="text-muted-foreground mb-4">You don't have any trips happening right now.</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="upcoming">
                {sortedUpcomingTrips.length > 0 ? (
                  <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {sortedUpcomingTrips.map((trip) => (
                      <TripCard key={trip.id} trip={trip} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-muted/20 rounded-lg">
                    <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No upcoming trips</h3>
                    <p className="text-muted-foreground mb-4">Start planning your next adventure!</p>
                    <Button asChild>
                      <Link href="/trips/new">Plan a Trip</Link>
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="past">
                {sortedPastTrips.length > 0 ? (
                  <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {sortedPastTrips.map((trip) => (
                      <TripCard key={trip.id} trip={trip} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-muted/20 rounded-lg">
                    <LuggageIcon className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No past trips</h3>
                    <p className="text-muted-foreground mb-4">Your trip history will appear here.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          ) : (
            <div className="text-center py-16 bg-muted/20 rounded-lg">
              <LuggageIcon className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">No trips found</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {searchTerm ? 'No trips match your search. Try a different term.' : 'You don\'t have any trips yet. Create your first one!'}
              </p>
              <Button asChild>
                <Link href="/trips/new">Create Your First Trip</Link>
              </Button>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 