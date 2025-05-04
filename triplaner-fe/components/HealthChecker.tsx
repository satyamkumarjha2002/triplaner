'use client';

import { useEffect } from 'react';
import { healthCheckService } from '@/services/health';

/**
 * A component that manages the health check interval
 * This is a client-side component that starts/stops the health check
 * when mounted/unmounted.
 */
export function HealthChecker() {
  useEffect(() => {
    // Start health check when component mounts
    healthCheckService.startHealthCheck(10000);
    
    // Cleanup: stop health check when component unmounts
    return () => {
      healthCheckService.stopHealthCheck();
    };
  }, []);
  
  // This component doesn't render anything
  return null;
} 