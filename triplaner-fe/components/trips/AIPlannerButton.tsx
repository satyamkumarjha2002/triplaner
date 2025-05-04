import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AIPlannerModal } from './AIPlannerModal';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIPlannerButtonProps {
  onTripCreated?: () => void;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function AIPlannerButton({ 
  onTripCreated, 
  variant = 'default',
  size = 'default',
  className 
}: AIPlannerButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSuccess = () => {
    if (onTripCreated) {
      onTripCreated();
    }
  };

  // Check if we need to move the icon to the right (for when button is in header)
  const isIconRight = className?.includes('justify-start');

  return (
    <>
      <Button 
        onClick={handleOpenModal} 
        variant={variant}
        size={size}
        className={cn(
          "relative inline-flex items-center justify-center whitespace-nowrap z-10 font-medium",
          className
        )}
      >
        {!isIconRight && (
          <Sparkles className="mr-2 h-4 w-4 animate-pulse text-white/90" />
        )}
        Plan Trip with AI
        {isIconRight && (
          <Sparkles className="ml-2 h-4 w-4 animate-pulse text-white/90" />
        )}
      </Button>
      
      <AIPlannerModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        onSuccess={handleSuccess}
      />
    </>
  );
} 