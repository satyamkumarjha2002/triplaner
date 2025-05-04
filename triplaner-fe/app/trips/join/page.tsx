'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { tripService } from '@/services/trips';

const formSchema = z.object({
  tripCode: z.string().min(6, {
    message: 'Trip code must be at least 6 characters',
  }).max(20),
});

export default function JoinTripPage() {
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
      // This would be replaced with an actual API call
      await tripService.joinTripByCode(values.tripCode);
      router.push('/trips');
    } catch (err) {
      console.error('Failed to join trip:', err);
      setError('Invalid trip code or you may not have permission to join this trip.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="container py-6 md:py-8">
          <div className="flex flex-col items-center justify-center max-w-md mx-auto">
            <h1 className="text-3xl font-bold tracking-tight mb-6 text-center">Join a Trip</h1>
            
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Enter Trip Code</CardTitle>
                <CardDescription>
                  Enter the code shared with you to join a trip
                </CardDescription>
              </CardHeader>
              <CardContent>
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
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Joining...' : 'Join Trip'}
                    </Button>
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="flex justify-center text-sm text-muted-foreground">
                Trip codes are usually shared by the trip organizer
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 