import React, { useState } from 'react';
import { XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface DeclineReasonDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onDecline: (reason?: string) => void;
  invitationTitle?: string;
}

export function DeclineReasonDialog({ isOpen, onClose, onDecline, invitationTitle }: DeclineReasonDialogProps) {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onDecline(reason || undefined);
      setReason('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    setIsSubmitting(true);
    try {
      await onDecline();
      setReason('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Decline Invitation</DialogTitle>
          <DialogDescription>
            {invitationTitle 
              ? `You're about to decline the invitation to "${invitationTitle}".`
              : "You're about to decline this invitation."} 
            You can provide a reason why you're declining (optional).
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Your reason for declining (optional)"
            className="w-full"
            rows={4}
            disabled={isSubmitting}
          />
        </div>
        
        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleSkip}
            disabled={isSubmitting}
          >
            Decline without reason
          </Button>
          <Button 
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="mb-2 sm:mb-0"
          >
            <XIcon className="h-4 w-4 mr-2" />
            Decline
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 