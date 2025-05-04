'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { tripService } from '@/services/trips';

const formSchema = z.object({
  tripCode: z.string().min(6, {
    message: 'Trip code must be at least 6 characters',
  }).max(20),
});

interface JoinTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function JoinTripModal({ isOpen, onClose, onSuccess }: JoinTripModalProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tripCode: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError(null);

    try {
      await tripService.joinTripByCode(values.tripCode);
      
      // Reset form
      form.reset();
      
      // Close modal
      onClose();
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      } else {
        // Redirect to trips page
        router.push('/trips');
      }
    } catch (err) {
      console.error('Failed to join trip:', err);
      setError('Invalid trip code or you may not have permission to join this trip.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Join a Trip</DialogTitle>
          <DialogDescription>
            Enter the trip code shared with you to join a trip
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="tripCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trip Code</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter trip code" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            
            <DialogFooter className="mt-6">
              <Button variant="outline" type="button" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Joining...' : 'Join Trip'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 