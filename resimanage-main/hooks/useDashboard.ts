
import { useCallback } from 'react';
import { useDashboardStore } from '../stores/dashboardStore';
import { getDashboardStats } from '../utils/mockApi';

export const useDashboard = () => {
  const { stats, isLoading, error, setStats, setLoading, setError } = useDashboardStore();

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Use local mock API to prevent network errors from missing backend
      const data = await getDashboardStats();
      setStats(data);
    } catch (err: any) {
      // Error is handled by state
      setError('Không thể tải dữ liệu tổng quan');
    } finally {
      setLoading(false);
    }
  }, [setStats, setLoading, setError]);

  return {
    stats,
    isLoading,
    error,
    fetchStats
  };
};
