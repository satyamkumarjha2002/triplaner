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
  private maxFailedChecks = 2; // Number of failed checks before considering disconnected
  
  /**
   * Start health check polling to the server
   * @param interval Polling interval in milliseconds (default: 10000ms)
   */
  startHealthCheck(interval = 10000) {
    if (this.isCheckActive) return;
    
    this.isCheckActive = true;
    
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
   * Perform a single health check
   */
  private async performCheck() {
    try {
      const response = await api.get<HealthCheckResponse>('/auth/isAlive');
      console.log('Health check:', response.message);
      
      // Reset failed check counter and update status
      this.failedChecks = 0;
      this.setConnectionStatus('connected');
      
      // Run success callbacks
      this.onSuccessCallbacks.forEach(callback => {
        try {
          callback();
        } catch (error) {
          console.error('Error in health check success callback:', error);
        }
      });
      
      return response;
    } catch (error) {
      console.error('Health check failed:', error);
      
      // Increment failed check counter
      this.failedChecks++;
      
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