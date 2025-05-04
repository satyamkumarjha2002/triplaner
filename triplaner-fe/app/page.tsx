'use client';

import Link from 'next/link';
import { MapPinIcon, UsersIcon, CalendarIcon, HeartIcon, ArrowRightIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';

export default function HomePage() {
  const { isAuthenticated, loading } = useAuth();
  
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-r from-blue-50 to-teal-50 dark:from-gray-900 dark:to-gray-950">
          <div className="absolute inset-0 z-0 opacity-5 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:20px_20px]"></div>
          
          <div className="container relative z-10 py-20 md:py-32">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
                  Plan trips together, <span className="bg-gradient-to-r from-blue-600 to-teal-500 text-transparent bg-clip-text">effortlessly</span>
                </h1>
                <p className="text-lg text-muted-foreground mb-8 max-w-lg">
                  Coordinate, vote, and budget with friends. All your trip planning in one beautiful app.
                </p>
                <div className="flex flex-wrap gap-4">
                  {!isAuthenticated && !loading ? (
                    <>
                      <Button asChild size="lg" className="gap-2">
                        <Link href="/auth/register">
                          Get Started
                          <ArrowRightIcon className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="lg">
                        <Link href="/auth/login">Sign In</Link>
                      </Button>
                    </>
                  ) : (
                    <Button asChild size="lg" className="gap-2">
                      <Link href="/dashboard">
                        Go to Dashboard
                        <ArrowRightIcon className="h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                </div>
                <div className="mt-8 flex items-center">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="inline-block h-8 w-8 rounded-full bg-gradient-to-r from-blue-400 to-teal-400 border-2 border-white dark:border-gray-900"></div>
                    ))}
                  </div>
                  <p className="ml-4 text-sm text-muted-foreground">
                    Loved by <span className="font-medium text-foreground">5,000+</span> travelers
                  </p>
                </div>
              </div>
              
              <div className="relative hidden md:block">
                <div className="absolute -top-4 -left-4 bg-blue-100 dark:bg-blue-900/30 h-full w-full rounded-xl"></div>
                <div className="absolute -bottom-4 -right-4 bg-teal-100 dark:bg-teal-900/30 h-full w-full rounded-xl"></div>
                <div className="relative z-10 bg-card border shadow-xl rounded-xl p-6 transform rotate-1">
                  <div className="aspect-video bg-gradient-to-br from-blue-50 to-teal-50 dark:from-gray-800 dark:to-gray-700 rounded-lg flex items-center justify-center">
                    <div className="text-center p-6">
                      <CalendarIcon className="mx-auto h-10 w-10 text-primary mb-4" />
                      <h3 className="text-xl font-medium mb-2">Dashboard Preview</h3>
                      <p className="text-sm text-muted-foreground">Beautiful interface for managing your trips</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-20 bg-card dark:bg-background">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Everything you need for trip planning</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Planit brings together all your trip planning needs in one beautiful, easy-to-use app.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-background dark:bg-card/50 border rounded-xl p-6 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                  <UsersIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-medium mb-2">Collaborative Planning</h3>
                <p className="text-muted-foreground">
                  Invite friends to plan together. Add activities, vote on options, and keep everyone on the same page.
                </p>
              </div>
              
              <div className="bg-background dark:bg-card/50 border rounded-xl p-6 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                  <CalendarIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-medium mb-2">Interactive Itinerary</h3>
                <p className="text-muted-foreground">
                  Visualize your trip day-by-day. Easily organize activities with drag-and-drop simplicity.
                </p>
              </div>
              
              <div className="bg-background dark:bg-card/50 border rounded-xl p-6 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4">
                  <HeartIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-medium mb-2">Voting & Consensus</h3>
                <p className="text-muted-foreground">
                  Let everyone have a say. Vote on activities and see what the group prefers in real-time.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* How It Works Section */}
        <section className="py-20 bg-muted/30">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">How It Works</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Planning trips with friends has never been easier
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  step: 1,
                  title: 'Create a Trip',
                  description: 'Start a new trip and add basic details like dates and destination'
                },
                {
                  step: 2,
                  title: 'Invite Friends',
                  description: 'Share a link with friends so they can join your trip planning'
                },
                {
                  step: 3,
                  title: 'Add Activities',
                  description: 'Everyone can suggest activities, places to visit, and accommodations'
                },
                {
                  step: 4,
                  title: 'Finalize & Enjoy',
                  description: 'Vote on options, finalize the itinerary, and enjoy your trip!'
                }
              ].map((item) => (
                <div key={item.step} className="relative">
                  <div className="bg-primary/10 dark:bg-primary/5 rounded-xl p-6 border border-primary/10">
                    <div className="absolute -top-4 -right-4 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                      {item.step}
                    </div>
                    <h3 className="text-lg font-medium mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-teal-500 text-white">
          <div className="container text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to start planning your next adventure?</h2>
            <p className="text-blue-50 mb-8 max-w-2xl mx-auto">
              Join thousands of travelers who are using Planit to make their group trips unforgettable.
            </p>
            <Button asChild size="lg" variant="secondary" className="gap-2">
              <Link href="/auth/register">
                Create Your Free Account
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
