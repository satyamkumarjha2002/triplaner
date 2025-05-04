'use client';

import { useEffect, useState } from 'react';
import { type ConnectionStatus, healthCheckService } from '@/services/health';
import { WifiIcon, WifiOffIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Component that displays the current server connection status
 */
export function ConnectionStatus() {
  const [status, setStatus] = useState<ConnectionStatus>('unknown');
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    // Register to receive status updates
    const unregister = healthCheckService.onStatusChange((newStatus) => {
      setStatus(newStatus);
      
      // Only show indicator when disconnected or when first connected after being disconnected
      if (newStatus === 'disconnected') {
        setVisible(true);
      } else if (newStatus === 'connected' && status === 'disconnected') {
        // Show briefly when connection is restored
        setVisible(true);
        const timer = setTimeout(() => {
          setVisible(false);
        }, 3000);
        return () => clearTimeout(timer);
      }
    });
    
    return unregister;
  }, [status]);
  
  // Don't show anything if unknown or not visible
  if (status === 'unknown' || !visible) return null;
  
  return (
    <div className={cn(
      "fixed bottom-4 right-4 z-50 px-4 py-2 rounded-full shadow-md transition-all duration-300",
      status === 'connected' ? "bg-green-500 text-white" : "bg-red-500 text-white"
    )}>
      <div className="flex items-center gap-2">
        {status === 'connected' ? (
          <>
            <WifiIcon className="h-4 w-4" />
            <span className="text-sm font-medium">Connected</span>
          </>
        ) : (
          <>
            <WifiOffIcon className="h-4 w-4" />
            <span className="text-sm font-medium">Disconnected</span>
          </>
        )}
      </div>
    </div>
  );
} 