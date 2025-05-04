'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { CalendarIcon, ClockIcon, MapPinIcon, DollarSignIcon } from 'lucide-react';
import { format } from 'date-fns';

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
  const [error, setError] = useState<string>('');

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

    try {
      // Format the data for the API
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
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span className="text-muted-foreground">Pick a date</span>
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
                    />
                  </PopoverContent>
                </Popover>
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

        {error && <p className="text-sm text-red-500">{error}</p>}
        
        <Button 
          type="submit" 
          className={cn("w-full", isInModal ? "mt-6" : "")} 
          disabled={isLoading}
        >
          {isLoading ? 'Adding activity...' : 'Add Activity'}
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