/**
 * Network Monitoring Utility
 * 
 * This utility helps debug network issues by:
 * 1. Logging all Supabase API requests
 * 2. Tracking request duration
 * 3. Identifying pending/failed requests
 * 4. Providing network health status
 */

interface NetworkRequest {
  url: string;
  method: string;
  startTime: number;
  endTime?: number;
  status?: number;
  statusText?: string;
  error?: Error;
  duration?: number;
}

class NetworkMonitor {
  private requests: Map<string, NetworkRequest> = new Map();
  private isEnabled: boolean;

  constructor() {
    // Only enable in development mode
    this.isEnabled = typeof window !== 'undefined' && 
                     (process.env.NODE_ENV === 'development' || 
                      localStorage.getItem('enableNetworkMonitor') === 'true');
  }

  /**
   * Start tracking a request
   */
  startRequest(url: string, method: string = 'GET'): string {
    if (!this.isEnabled) return '';
    
    const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const request: NetworkRequest = {
      url,
      method,
      startTime: Date.now()
    };
    
    this.requests.set(requestId, request);
    
    if (url.includes('supabase.co')) {
      console.log(`🌐 [Network] → ${method} ${url}`, {
        requestId,
        timestamp: new Date().toISOString()
      });
    }
    
    return requestId;
  }

  /**
   * Complete tracking a request
   */
  endRequest(requestId: string, status?: number, statusText?: string, error?: Error) {
    if (!this.isEnabled || !requestId) return;
    
    const request = this.requests.get(requestId);
    if (!request) return;
    
    request.endTime = Date.now();
    request.duration = request.endTime - request.startTime;
    request.status = status;
    request.statusText = statusText;
    request.error = error || undefined;
    
    if (request.url.includes('supabase.co')) {
      if (error || (status && status >= 400)) {
        console.error(`❌ [Network] ✗ ${request.method} ${request.url}`, {
          status,
          statusText,
          duration: `${request.duration}ms`,
          error: error?.message,
          timestamp: new Date().toISOString()
        });
      } else {
        console.log(`✅ [Network] ✓ ${request.method} ${request.url}`, {
          status,
          duration: `${request.duration}ms`,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    // Clean up old requests (keep last 50)
    if (this.requests.size > 50) {
      const firstKey = this.requests.keys().next().value;
      this.requests.delete(firstKey);
    }
  }

  /**
   * Get all pending requests (requests that started but never completed)
   */
  getPendingRequests(): NetworkRequest[] {
    return Array.from(this.requests.values())
      .filter(req => !req.endTime && Date.now() - req.startTime > 5000); // Older than 5 seconds
  }

  /**
   * Get all failed requests
   */
  getFailedRequests(): NetworkRequest[] {
    return Array.from(this.requests.values())
      .filter(req => req.error || (req.status && req.status >= 400));
  }

  /**
   * Get network health summary
   */
  getHealthSummary() {
    const allRequests = Array.from(this.requests.values());
    const completed = allRequests.filter(r => r.endTime);
    const pending = allRequests.filter(r => !r.endTime);
    const failed = completed.filter(r => r.error || (r.status && r.status >= 400));
    const avgDuration = completed.length > 0
      ? completed.reduce((sum, r) => sum + (r.duration || 0), 0) / completed.length
      : 0;

    return {
      total: allRequests.length,
      completed: completed.length,
      pending: pending.length,
      failed: failed.length,
      successRate: completed.length > 0 
        ? ((completed.length - failed.length) / completed.length * 100).toFixed(1) + '%'
        : 'N/A',
      avgDuration: `${Math.round(avgDuration)}ms`,
      pendingRequests: pending.map(r => ({
        url: r.url,
        method: r.method,
        waitingTime: `${Date.now() - r.startTime}ms`
      })),
      recentFailures: failed.slice(-5).map(r => ({
        url: r.url,
        method: r.method,
        status: r.status,
        error: r.error?.message,
        duration: `${r.duration}ms`
      }))
    };
  }

  /**
   * Log network health summary
   */
  logHealthSummary() {
    if (!this.isEnabled) return;
    
    const summary = this.getHealthSummary();
    console.group('📊 Network Health Summary');
    console.log(`Total Requests: ${summary.total}`);
    console.log(`Completed: ${summary.completed}`);
    console.log(`Pending: ${summary.pending}`);
    console.log(`Failed: ${summary.failed}`);
    console.log(`Success Rate: ${summary.successRate}`);
    console.log(`Avg Duration: ${summary.avgDuration}`);
    
    if (summary.pendingRequests.length > 0) {
      console.warn('⚠️ Pending Requests:', summary.pendingRequests);
    }
    
    if (summary.recentFailures.length > 0) {
      console.error('❌ Recent Failures:', summary.recentFailures);
    }
    
    console.groupEnd();
  }

  /**
   * Clear all tracked requests
   */
  clear() {
    this.requests.clear();
  }
}

// Export singleton instance
export const networkMonitor = new NetworkMonitor();

// Auto-log health summary every 30 seconds in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  setInterval(() => {
    const summary = networkMonitor.getHealthSummary();
    if (summary.pending > 0 || summary.failed > 0) {
      networkMonitor.logHealthSummary();
    }
  }, 30000);
}

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).networkMonitor = networkMonitor;
}

