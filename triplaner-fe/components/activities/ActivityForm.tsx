'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { CalendarIcon, ClockIcon, MapPinIcon, DollarSignIcon } from 'lucide-react';
import { format, isAfter, isBefore } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { activityService } from '@/services/activities';
import { tripService } from '@/services/trips';
import { CreateActivityData } from '@/services/activities';
import { cn } from '@/lib/utils';

interface ActivityFormProps {
  tripId: string;
  onSuccess?: () => void;
  isInModal?: boolean;
}

const formSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters' }),
  date: z.date({
    required_error: 'Date is required',
  }),
  time: z.string().optional(),
  category: z.enum(['Adventure', 'Food', 'Sightseeing', 'Other'], {
    required_error: 'Category is required',
  }),
  estimatedCost: z.string().optional(),
  notes: z.string().optional(),
});

export function ActivityForm({ tripId, onSuccess, isInModal = false }: ActivityFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingTrip, setIsFetchingTrip] = useState(true);
  const [error, setError] = useState<string>('');
  const [tripDates, setTripDates] = useState<{ startDate: Date | null; endDate: Date | null }>({
    startDate: null,
    endDate: null
  });

  useEffect(() => {
    const fetchTripDates = async () => {
      setIsFetchingTrip(true);
      try {
        const trip = await tripService.getTripById(tripId);
        setTripDates({
          startDate: new Date(trip.startDate),
          endDate: new Date(trip.endDate)
        });
      } catch (err) {
        console.error('Failed to fetch trip dates:', err);
        setError('Failed to fetch trip dates. Please try again.');
      } finally {
        setIsFetchingTrip(false);
      }
    };

    fetchTripDates();
  }, [tripId]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      category: 'Adventure',
      time: '',
      estimatedCost: '',
      notes: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError('');

    if (tripDates.startDate && isBefore(values.date, tripDates.startDate)) {
      setError(`Activity date cannot be before the trip start date (${format(tripDates.startDate, 'MMM d, yyyy')})`);
      setIsLoading(false);
      return;
    }

    if (tripDates.endDate && isAfter(values.date, tripDates.endDate)) {
      setError(`Activity date cannot be after the trip end date (${format(tripDates.endDate, 'MMM d, yyyy')})`);
      setIsLoading(false);
      return;
    }

    try {
      const activityData: CreateActivityData = {
        title: values.title,
        date: format(values.date, 'yyyy-MM-dd'),
        time: values.time || undefined,
        category: values.category,
        estimatedCost: values.estimatedCost ? parseFloat(values.estimatedCost) : undefined,
        notes: values.notes || undefined,
      };
      
      await activityService.createActivity(tripId, activityData);
      
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(`/trips/${tripId}`);
        router.refresh();
      }
    } catch (err) {
      console.error('Create activity error:', err);
      setError('Failed to create activity. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  const formContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Activity Title</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input 
                    placeholder="Kayaking at Sunset Beach" 
                    className="pl-9" 
                    {...field} 
                  />
                  <MapPinIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className="pl-3 text-left font-normal h-10 w-full"
                        disabled={isFetchingTrip}
                      >
                        {isFetchingTrip ? (
                          <span className="text-muted-foreground">Loading trip dates...</span>
                        ) : field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span className="text-muted-foreground">Pick a date within trip range</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                      disabled={(date) => {
                        if (!tripDates.startDate || !tripDates.endDate) return false;
                        return isBefore(date, tripDates.startDate) || isAfter(date, tripDates.endDate);
                      }}
                    />
                  </PopoverContent>
                </Popover>
                {!isFetchingTrip && tripDates.startDate && tripDates.endDate && (
                  <FormDescription>
                    Select a date between {format(tripDates.startDate, "MMM d, yyyy")} and {format(tripDates.endDate, "MMM d, yyyy")}
                  </FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time (optional)</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      type="time" 
                      className="pl-9"
                      {...field}
                    />
                    <ClockIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Adventure">Adventure</SelectItem>
                    <SelectItem value="Food">Food</SelectItem>
                    <SelectItem value="Sightseeing">Sightseeing</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="estimatedCost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estimated Cost (optional)</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      type="number" 
                      placeholder="100" 
                      className="pl-9"
                      {...field} 
                    />
                    <DollarSignIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
                </FormControl>
                <FormDescription>USD</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Any additional information or tips" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {error && (
          <div className="bg-destructive/10 p-3 rounded-md border border-destructive">
            <p className="text-sm text-destructive font-medium">{error}</p>
          </div>
        )}
        
        <Button 
          type="submit" 
          className={cn("w-full", isInModal ? "mt-6" : "")} 
          disabled={isLoading || isFetchingTrip}
        >
          {isLoading ? 'Adding activity...' : isFetchingTrip ? 'Loading trip dates...' : 'Add Activity'}
        </Button>
      </form>
    </Form>
  );

  if (isInModal) {
    return formContent;
  }

  return (
    <Card className="mx-auto max-w-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Add an Activity</CardTitle>
        <CardDescription>Add a new activity to your trip itinerary</CardDescription>
      </CardHeader>
      <CardContent>
        {formContent}
      </CardContent>
    </Card>
  );
} 