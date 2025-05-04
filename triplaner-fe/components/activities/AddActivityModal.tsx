'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ActivityForm } from '@/components/activities/ActivityForm';
import { cn } from '@/lib/utils';

interface AddActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripId: string;
  onSuccess?: () => void;
}

export function AddActivityModal({ 
  isOpen, 
  onClose, 
  tripId,
  onSuccess
}: AddActivityModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={cn(
        "sm:max-w-[550px] p-0 gap-0 overflow-hidden",
        "border-none shadow-lg rounded-lg"
      )}>
        <DialogHeader className="px-6 pt-6 pb-2 bg-background sticky top-0 z-10 border-b">
          <DialogTitle className="text-xl font-semibold">Add Activity</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Add a new activity to your trip itinerary
          </DialogDescription>
        </DialogHeader>
        
        <div className="px-6 py-4 max-h-[80vh] overflow-y-auto">
          <ActivityForm 
            tripId={tripId} 
            isInModal={true}
            onSuccess={() => {
              onClose();
              if (onSuccess) {
                onSuccess();
              }
            }} 
          />
        </div>
      </DialogContent>
    </Dialog>
  );
} 