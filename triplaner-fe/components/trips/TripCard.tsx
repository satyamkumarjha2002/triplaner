'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { CalendarIcon, UsersIcon, WalletIcon, MapPinIcon, ArrowRightIcon } from 'lucide-react';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Trip } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TripCardProps {
  trip: Trip;
}

export function TripCard({ trip }: TripCardProps) {
  // Format dates for display
  const startDate = new Date(trip.startDate);
  const endDate = new Date(trip.endDate);

  // Calculate trip status
  const today = new Date();
  let status: 'upcoming' | 'ongoing' | 'past';
  
  if (today < startDate) {
    status = 'upcoming';
  } else if (today > endDate) {
    status = 'past';
  } else {
    status = 'ongoing';
  }

  // Format dates as strings
  const formattedStartDate = startDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  
  const formattedEndDate = endDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Get time until trip starts
  const timeUntil = status === 'upcoming' 
    ? formatDistanceToNow(startDate, { addSuffix: true })
    : '';
    
  // Calculate days left
  const daysLeft = status === 'upcoming' 
    ? Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <Link href={`/trips/${trip.id}`} className="block h-full">
      <Card className={cn(
        "h-full overflow-hidden transition-all duration-200 hover:shadow-lg",
        status === 'upcoming' && "border-blue-200 dark:border-blue-900",
        status === 'ongoing' && "border-green-200 dark:border-green-900",
        status === 'past' && "border-gray-200 dark:border-gray-800 opacity-80"
      )}>
        <div className={cn(
          "h-2",
          status === 'upcoming' && "bg-blue-500",
          status === 'ongoing' && "bg-green-500",
          status === 'past' && "bg-gray-300 dark:bg-gray-700"
        )} />
        <CardHeader className="pb-2 px-4 pt-4 md:px-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center">
              <MapPinIcon className={cn(
                "mr-2 h-5 w-5",
                status === 'upcoming' && "text-blue-500",
                status === 'ongoing' && "text-green-500",
                status === 'past' && "text-gray-400"
              )} />
              <CardTitle className="text-xl">{trip.name}</CardTitle>
            </div>
            {status === 'upcoming' && (
              <Badge className="bg-blue-500 hover:bg-blue-600">Upcoming</Badge>
            )}
            {status === 'ongoing' && (
              <Badge className="bg-green-500 hover:bg-green-600">Ongoing</Badge>
            )}
            {status === 'past' && (
              <Badge variant="outline">Past</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="px-4 md:px-6">
          <div className="space-y-3">
            <div className="flex items-center text-sm">
              <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>
                {formattedStartDate} - {formattedEndDate}
              </span>
            </div>
            
            <div className="flex items-center text-sm">
              <UsersIcon className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{trip.participants.length} participants</span>
            </div>
            
            {trip.budget && (
              <div className="flex items-center text-sm">
                <WalletIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Budget: ${trip.budget}</span>
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between items-center mt-2 px-4 pb-4 md:px-6">
          {status === 'upcoming' ? (
            <div className="text-sm font-medium">
              {daysLeft === 0 ? (
                <span className="text-blue-600 dark:text-blue-400">Starts today!</span>
              ) : daysLeft === 1 ? (
                <span className="text-blue-600 dark:text-blue-400">Starts tomorrow!</span>
              ) : (
                <span className="text-muted-foreground">Starts in {daysLeft} days</span>
              )}
            </div>
          ) : status === 'ongoing' ? (
            <span className="text-sm text-green-600 dark:text-green-400 font-medium">Happening now</span>
          ) : (
            <span className="text-sm text-muted-foreground">Completed</span>
          )}
          
          <Button variant="ghost" size="sm" className="gap-1 text-xs" aria-label={`View ${trip.name} details`}>
            Details <ArrowRightIcon className="h-3 w-3" />
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
} 