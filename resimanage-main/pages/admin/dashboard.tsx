
import React from 'react';
import { useAdminDashboard } from '../../hooks/useAdminDashboard';
import StatCard from '../../components/dashboard/StatCard';
import GenderDistributionChart from '../../components/dashboard/GenderDistributionChart';
import AgeDistributionChart from '../../components/dashboard/AgeDistributionChart';
import DashboardSkeleton from '../../components/skeletons/DashboardSkeleton';
import { AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

const AdminDashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const { data, isLoading, error } = useAdminDashboard();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-slate-800">
          Xin chào, {user?.fullName || 'Admin'}!
        </h1>
        <p className="text-slate-500">
          Dưới đây là tổng quan về tình hình khu dân cư hôm nay.
        </p>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Stats Grid */}
      {/* Updated: grid-cols-1 for mobile, md:grid-cols-2 for tablet, lg:grid-cols-4 for desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {data?.statCards.map((stat) => (
          <StatCard
            key={stat.id}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
          />
        ))}
      </div>

      {/* Charts Section */}
      {/* Updated: Stack vertically on mobile/tablet (default), side-by-side on large screens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {data && (
          <>
            <GenderDistributionChart data={data.demographics.genderData} />
            <AgeDistributionChart data={data.demographics.ageData} />
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
