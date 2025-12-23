
import React, { useState, useCallback, useEffect } from 'react';

interface UseApiResult<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  execute: (...args: any[]) => Promise<T | undefined>;
  setData: React.Dispatch<React.SetStateAction<T | null>>;
  reset: () => void;
}

/**
 * A generic hook for managing async API calls state (loading, error, data).
 * @param asyncAction The async function to execute.
 * @param immediate If true, executes the function immediately on mount (requires asyncAction to have no required args or handled internally).
 */
export function useApi<T>(
  asyncAction: (...args: any[]) => Promise<T>,
  immediate = false
): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(immediate);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (...args: any[]) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await asyncAction(...args);
      setData(response);
      return response;
    } catch (err: any) {
      const errorMessage = err.message || 'Đã có lỗi xảy ra';
      setError(errorMessage);
      // Suppress console error for production cleanliness
      // console.error("API Error:", err);
      return undefined;
    } finally {
      setIsLoading(false);
    }
  }, [asyncAction]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { data, isLoading, error, execute, setData, reset };
}
