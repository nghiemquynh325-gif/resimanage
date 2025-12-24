import React, { useEffect } from 'react';
import DashboardComponent from '../components/Dashboard';
import { useDashboard } from '../hooks/useDashboard';

const DashboardPage: React.FC = () => {
  const { stats, isLoading, error, fetchStats } = useDashboard();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (error) {
    // Error is displayed in UI below
  }

  return (
    <div>
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">
          Lỗi: {error}
        </div>
      )}
      <DashboardComponent stats={stats} isLoading={isLoading} />
    </div>
  );
};

export default DashboardPage;
