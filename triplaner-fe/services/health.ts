import { api } from './api';

interface HealthCheckResponse {
  message: string;
}

// Connection status types
export type ConnectionStatus = 'connected' | 'disconnected' | 'unknown';

class HealthCheckService {
  private checkInterval: NodeJS.Timeout | null = null;
  private isCheckActive = false;
  private onSuccessCallbacks: (() => void)[] = [];
  private onStatusChangeCallbacks: ((status: ConnectionStatus) => void)[] = [];
  private connectionStatus: ConnectionStatus = 'unknown';
  private failedChecks = 0;
  private maxFailedChecks = 10; // Number of failed checks before considering disconnected
  private authFailureDetected = false; // Flag to track auth failures
  private backoffTime = 10000; // Base interval time in ms
  private lastSuccessfulCheck = 0; // Timestamp of last successful check
  private MIN_SUCCESS_INTERVAL = 30000; // Minimum time between triggering success callbacks (30 seconds)
  
  /**
   * Start health check polling to the server
   * @param interval Polling interval in milliseconds (default: 10000ms)
   */
  startHealthCheck(interval = 10000) {
    if (this.isCheckActive) return;
    
    this.isCheckActive = true;
    this.backoffTime = interval;
    
    // Perform an immediate check
    this.performCheck();
    
    // Set up interval for subsequent checks
    this.checkInterval = setInterval(() => {
      this.performCheck();
    }, interval);
    
    console.log(`Health check started with ${interval}ms interval`);
  }
  
  /**
   * Stop health check polling
   */
  stopHealthCheck() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      this.isCheckActive = false;
      console.log('Health check stopped');
    }
  }
  
  /**
   * Register a callback to run when health check succeeds
   * @param callback Function to call on successful health check
   */
  onSuccess(callback: () => void) {
    this.onSuccessCallbacks.push(callback);
    return () => {
      this.onSuccessCallbacks = this.onSuccessCallbacks.filter(cb => cb !== callback);
    };
  }
  
  /**
   * Register a callback to run when connection status changes
   * @param callback Function to call on status change
   */
  onStatusChange(callback: (status: ConnectionStatus) => void) {
    // Call immediately with current status
    callback(this.connectionStatus);
    
    // Register for future updates
    this.onStatusChangeCallbacks.push(callback);
    return () => {
      this.onStatusChangeCallbacks = this.onStatusChangeCallbacks.filter(cb => cb !== callback);
    };
  }
  
  /**
   * Get current connection status
   */
  getConnectionStatus(): ConnectionStatus {
    return this.connectionStatus;
  }
  
  /**
   * Update connection status and notify listeners if changed
   */
  private setConnectionStatus(status: ConnectionStatus) {
    if (status !== this.connectionStatus) {
      this.connectionStatus = status;
      this.onStatusChangeCallbacks.forEach(callback => {
        try {
          callback(status);
        } catch (error) {
          console.error('Error in connection status callback:', error);
        }
      });
    }
  }
  
  /**
   * Apply exponential backoff to health check interval when failures occur
   */
  private applyBackoff() {
    if (!this.checkInterval) return;
    
    // Clear current interval
    clearInterval(this.checkInterval);
    
    // Calculate new interval with exponential backoff (max 2 minutes)
    const newInterval = Math.min(this.backoffTime * Math.pow(1.5, this.failedChecks), 120000);
    
    console.log(`Health check interval adjusted to ${newInterval}ms due to failures`);
    
    // Set new interval
    this.checkInterval = setInterval(() => {
      this.performCheck();
    }, newInterval);
  }
  
  /**
   * Reset health check to normal interval
   */
  private resetBackoff(interval = 10000) {
    if (!this.checkInterval) return;
    
    // Clear current interval
    clearInterval(this.checkInterval);
    
    // Reset to base interval
    this.backoffTime = interval;
    
    console.log(`Health check interval reset to ${interval}ms`);
    
    // Set new interval
    this.checkInterval = setInterval(() => {
      this.performCheck();
    }, interval);
  }
  
  /**
   * Perform a single health check
   */
  private async performCheck() {
    // Skip check if auth failure was detected recently to prevent spam
    if (this.authFailureDetected) {
      console.log('Health check skipped due to recent auth failure');
      return null;
    }
    
    try {
      const response = await api.get<HealthCheckResponse>('/auth/isAlive');
      console.log('Health check:', response.message);
      
      // Reset failed check counter and update status
      this.failedChecks = 0;
      this.authFailureDetected = false;
      this.setConnectionStatus('connected');
      
      // Reset to normal interval if we were in backoff
      if (this.backoffTime > 10000) {
        this.resetBackoff();
      }
      
      const now = Date.now();
      // Only trigger success callbacks if enough time has passed since the last success
      if (now - this.lastSuccessfulCheck >= this.MIN_SUCCESS_INTERVAL) {
        // Run success callbacks
        this.onSuccessCallbacks.forEach(callback => {
          try {
            callback();
          } catch (error) {
            console.error('Error in health check success callback:', error);
          }
        });
        this.lastSuccessfulCheck = now;
      }
      
      return response;
    } catch (error: any) {
      console.error('Health check failed:', error);
      
      // Check for auth errors (401)
      if (error?.response?.status === 401) {
        console.log('Auth failure detected in health check');
        this.authFailureDetected = true;
        
        // Reset after a delay
        setTimeout(() => {
          this.authFailureDetected = false;
        }, 30000); // Wait 30 seconds before trying again
        
        return null;
      }
      
      // Increment failed check counter for non-auth failures
      this.failedChecks++;
      
      // Apply backoff if we have failures
      if (this.failedChecks > 0) {
        this.applyBackoff();
      }
      
      // If we've had multiple consecutive failures, consider disconnected
      if (this.failedChecks >= this.maxFailedChecks) {
        this.setConnectionStatus('disconnected');
      }
      
      return null;
    }
  }
  
  /**
   * Check if health check is currently active
   */
  isActive(): boolean {
    return this.isCheckActive;
  }
}

// Create singleton instance
export const healthCheckService = new HealthCheckService(); 