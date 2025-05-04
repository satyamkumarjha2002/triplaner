'use client';

import { useEffect, useState } from 'react';
import { CalendarIcon, MapPinIcon, UsersIcon, CheckIcon, XIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { DeclineReasonDialog } from '@/components/invitations/DeclineReasonDialog';
import { tripService } from '@/services/trips';
import { Invitation } from '@/types';

export default function InvitationsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [declineDialogOpen, setDeclineDialogOpen] = useState(false);
  const [selectedInvitation, setSelectedInvitation] = useState<Invitation | null>(null);

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      setIsLoading(true);
      const data = await tripService.getUserInvitations();
      setInvitations(data);
    } catch (err) {
      console.error('Failed to fetch invitations', err);
      setError('Failed to load invitations. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (invitationId: string) => {
    try {
      setActionInProgress(invitationId);
      await tripService.acceptInvitation(invitationId);
      // Remove the accepted invitation from the list
      setInvitations(invitations.filter(inv => inv.id !== invitationId));
    } catch (err) {
      console.error('Failed to accept invitation', err);
      setError('Failed to accept invitation. Please try again.');
    } finally {
      setActionInProgress(null);
    }
  };

  const openDeclineDialog = (invitation: Invitation) => {
    setSelectedInvitation(invitation);
    setDeclineDialogOpen(true);
  };

  const handleDecline = async (reason?: string) => {
    if (!selectedInvitation) return;
    
    try {
      setActionInProgress(selectedInvitation.id);
      await tripService.declineInvitation(selectedInvitation.id, reason);
      // Remove the declined invitation from the list
      setInvitations(invitations.filter(inv => inv.id !== selectedInvitation.id));
    } catch (err) {
      console.error('Failed to decline invitation', err);
      setError('Failed to decline invitation. Please try again.');
    } finally {
      setActionInProgress(null);
      setSelectedInvitation(null);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="container py-6 md:py-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Trip Invitations</h1>
          <p className="text-muted-foreground mb-6">
            Manage your invitations to collaborate on trips
          </p>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-2">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-muted-foreground">Loading your invitations...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={() => fetchInvitations()}>Retry</Button>
            </div>
          ) : invitations.length > 0 ? (
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
              {invitations.map((invitation) => (
                <Card key={invitation.id} className="overflow-hidden border-blue-100 dark:border-blue-900/30">
                  <div className="h-1 bg-blue-500" />
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPinIcon className="h-5 w-5 text-blue-500" />
                      {invitation.trip?.name || 'Trip'}
                    </CardTitle>
                    <CardDescription>
                      Invited by {invitation.sender?.username || 'someone'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center text-sm">
                      <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>
                        {invitation.trip?.startDate && new Date(invitation.trip.startDate).toLocaleDateString()} - 
                        {invitation.trip?.endDate && new Date(invitation.trip.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-sm">
                      <UsersIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>{invitation.trip?.participants?.length || 0} participants</span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-3 justify-end">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => openDeclineDialog(invitation)}
                      disabled={actionInProgress === invitation.id}
                    >
                      <XIcon className="h-4 w-4 mr-1" />
                      Decline
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => handleAccept(invitation.id)}
                      disabled={actionInProgress === invitation.id}
                    >
                      <CheckIcon className="h-4 w-4 mr-1" />
                      Accept
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-muted/20 rounded-lg">
              <UsersIcon className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium mb-2">No invitations</h3>
              <p className="text-muted-foreground mb-4">
                You don't have any pending trip invitations at the moment
              </p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />

      {/* Decline Reason Dialog */}
      <DeclineReasonDialog 
        isOpen={declineDialogOpen}
        onClose={() => {
          setDeclineDialogOpen(false);
          setSelectedInvitation(null);
        }}
        onDecline={handleDecline}
        invitationTitle={selectedInvitation?.trip?.name}
      />
    </div>
  );
} 