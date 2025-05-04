'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { CalendarIcon, UsersIcon, WalletIcon, MapPinIcon, ArrowRightIcon, CheckCircleIcon, CircleIcon, ClockIcon } from 'lucide-react';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Trip } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TripCardProps {
  trip: Trip;
  // Add status prop to ensure consistency with parent component categorization
  status?: 'upcoming' | 'ongoing' | 'past';
}

export function TripCard({ trip, status: propStatus }: TripCardProps) {
  // Format dates for display
  const startDate = new Date(trip.startDate);
  const endDate = new Date(trip.endDate);

  // Calculate trip status if not provided via props
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Use status from props if available, otherwise calculate it
  const status = propStatus || (() => {
    const normalizedStartDate = new Date(startDate);
    normalizedStartDate.setHours(0, 0, 0, 0);
    
    const normalizedEndDate = new Date(endDate);
    normalizedEndDate.setHours(0, 0, 0, 0);
    
    if (today < normalizedStartDate) {
      return 'upcoming';
    } else if (today > normalizedEndDate) {
      return 'past';
    } else {
      return 'ongoing';
    }
  })();

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
    
  // Calculate days left more precisely - normalize both dates
  const calculateDaysLeft = () => {
    const todayNormalized = new Date(today);
    todayNormalized.setHours(0, 0, 0, 0);
    
    const startNormalized = new Date(startDate);
    startNormalized.setHours(0, 0, 0, 0);
    
    // Calculate the difference in days
    const timeDifference = startNormalized.getTime() - todayNormalized.getTime();
    return Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
  };
  
  const daysLeft = status === 'upcoming' ? calculateDaysLeft() : 0;
    
  // Duration in days
  const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  return (
    <Link href={`/trips/${trip.id}`} className="block h-full group">
      <Card className={cn(
        "h-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:transform hover:translate-y-[-2px]",
        status === 'upcoming' && "border-blue-200 hover:border-blue-300",
        status === 'ongoing' && "border-green-200 hover:border-green-300",
        status === 'past' && "border-gray-200 hover:border-gray-300 opacity-90 hover:opacity-100"
      )}>
        <div className={cn(
          "h-2.5",
          status === 'upcoming' && "bg-gradient-to-r from-blue-400 to-blue-600",
          status === 'ongoing' && "bg-gradient-to-r from-green-400 to-green-600",
          status === 'past' && "bg-gradient-to-r from-gray-300 to-gray-400"
        )} />
        <CardHeader className="pb-2 px-5 pt-5">
          <div className="flex justify-between items-start gap-2">
            <div className="flex items-center">
              <div className={cn(
                "h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0 mr-3",
                status === 'upcoming' && "bg-blue-100 text-blue-600",
                status === 'ongoing' && "bg-green-100 text-green-600",
                status === 'past' && "bg-gray-100 text-gray-500"
              )}>
                <MapPinIcon className="h-5 w-5" />
              </div>
              <CardTitle className="text-xl font-bold line-clamp-1">{trip.name}</CardTitle>
            </div>
            <div>
              {status === 'upcoming' && (
                <Badge className="bg-blue-500 hover:bg-blue-600 transition-colors shadow-sm">Upcoming</Badge>
              )}
              {status === 'ongoing' && (
                <Badge className="bg-green-500 hover:bg-green-600 transition-colors shadow-sm">Ongoing</Badge>
              )}
              {status === 'past' && (
                <Badge variant="outline" className="transition-colors shadow-sm">Past</Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-5 pt-3">
          <div className="space-y-3.5">
            <div className="flex items-center text-sm">
              <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="flex flex-col">
                <span className="text-sm font-medium">{formattedStartDate} - {formattedEndDate}</span>
                <span className="text-xs text-muted-foreground">{durationDays} {durationDays === 1 ? 'day' : 'days'}</span>
              </div>
            </div>
            
            <div className="flex items-center text-sm">
              <UsersIcon className="mr-2 h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="flex flex-col">
                <span className="text-sm font-medium">{trip.participants.length} {trip.participants.length === 1 ? 'participant' : 'participants'}</span>
                {trip.participants.length > 0 && (
                  <span className="text-xs text-muted-foreground line-clamp-1">
                    Including you
                  </span>
                )}
              </div>
            </div>
            
            {trip.budget && (
              <div className="flex items-center text-sm">
                <WalletIcon className="mr-2 h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div>
                  <span className="text-sm font-medium">Budget: ${trip.budget}</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between items-center mt-auto pt-3 px-5 pb-5 border-t border-border/50 mt-4">
          {status === 'upcoming' ? (
            <div className="flex items-center gap-1.5">
              <ClockIcon className={cn(
                "h-4 w-4",
                daysLeft <= 3 ? "text-blue-500" : "text-muted-foreground"
              )} />
              {daysLeft === 0 ? (
                <span className="text-sm font-medium text-blue-600">Starts today!</span>
              ) : daysLeft === 1 ? (
                <span className="text-sm font-medium text-blue-600">Starts tomorrow!</span>
              ) : (
                <span className="text-sm text-muted-foreground">In {daysLeft} days</span>
              )}
            </div>
          ) : status === 'ongoing' ? (
            <div className="flex items-center gap-1.5">
              <CircleIcon className="h-4 w-4 text-green-500 fill-green-500" />
              <span className="text-sm font-medium text-green-600">Happening now</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <CheckCircleIcon className="h-4 w-4 text-muted-foreground/70" />
              <span className="text-sm text-muted-foreground">Completed</span>
            </div>
          )}
          
          <Button variant="ghost" size="sm" className="gap-1 text-xs font-medium group-hover:bg-muted/80 transition-colors" aria-label={`View ${trip.name} details`}>
            Details <ArrowRightIcon className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
} 