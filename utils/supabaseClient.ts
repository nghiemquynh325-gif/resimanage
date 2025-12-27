
import { createClient } from '@supabase/supabase-js';
import { networkMonitor } from './networkMonitor';

// Configuration for Supabase Database
const supabaseUrl = 'https://etcwjkfiduzblrkdlzpp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0Y3dqa2ZpZHV6Ymxya2RsenBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxMTA4NDQsImV4cCI6MjA4MTY4Njg0NH0.NIhwxPq0oUlWTiKfYn2PP5SfNfhiriKNQZyLfE2Hvfk';

// Create a single supabase client for interacting with your database
// Added timeout and better error handling configuration
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'x-client-info': 'resimanage-web'
    }
  },
  db: {
    schema: 'public'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Network monitoring: Intercept fetch requests to monitor network activity
if (typeof window !== 'undefined') {
  const originalFetch = window.fetch;
  window.fetch = async function(...args) {
    const url = args[0]?.toString() || '';
    const method = args[1]?.method || 'GET';
    
    // Only monitor Supabase requests
    if (url.includes('supabase.co')) {
      const requestId = networkMonitor.startRequest(url, method);
      
      try {
        const response = await originalFetch.apply(this, args);
        
        // Clone response to read it without consuming the stream
        const clonedResponse = response.clone();
        let status = response.status;
        let statusText = response.statusText;
        
        // Try to get more details from response
        try {
          const text = await clonedResponse.text();
          if (text) {
            try {
              const json = JSON.parse(text);
              if (json.error) {
                networkMonitor.endRequest(requestId, status, statusText, new Error(json.error.message || json.error));
                return response;
              }
            } catch {
              // Not JSON, ignore
            }
          }
        } catch {
          // Couldn't read response, continue with status
        }
        
        networkMonitor.endRequest(
          requestId,
          status,
          statusText,
          !response.ok ? new Error(`HTTP ${status}: ${statusText}`) : undefined
        );
        
        return response;
      } catch (error) {
        networkMonitor.endRequest(requestId, undefined, undefined, error as Error);
        throw error;
      }
    } else {
      // Not a Supabase request, pass through
      return originalFetch.apply(this, args);
    }
  };
}
