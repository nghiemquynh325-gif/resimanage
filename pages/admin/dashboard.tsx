
import React from 'react';
import { useAdminDashboard } from '../../hooks/useAdminDashboard';
import StatCard from '../../components/dashboard/StatCard';
import GenderDistributionChart from '../../components/dashboard/GenderDistributionChart';
import AgeDistributionChart from '../../components/dashboard/AgeDistributionChart';
import UpcomingEventsWidget from '../../components/dashboard/UpcomingEventsWidget';
import ResidenceTypePieChart from '../../components/dashboard/ResidenceTypePieChart';
import EthnicityPieChart from '../../components/dashboard/EthnicityPieChart';
import ReligionPieChart from '../../components/dashboard/ReligionPieChart';
import HouseholdCategoryStats from '../../components/dashboard/HouseholdCategoryStats';
import DashboardSkeleton from '../../components/skeletons/DashboardSkeleton';
import { AlertCircle, Globe, Church } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

const AdminDashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const { data, isLoading, error } = useAdminDashboard();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-4 pb-8"> {/* Reduced from space-y-6 */}
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"> {/* Reduced gap from 6 to 4 */}
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

      {/* Household Categories - Compact horizontal layout */}
      {data && (
        <div className="mt-4"> {/* Reduced from mt-6 */}
          <HouseholdCategoryStats data={data.householdCategories} />
        </div>
      )}

      {/* Three Pie Charts in one row - Compact layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4"> {/* 3 columns on large screens, reduced gap and margin */}
        {data && (
          <>
            <ResidenceTypePieChart data={data.residenceTypes} />
            <EthnicityPieChart data={data.ethnicities} />
            <ReligionPieChart data={data.religions} />
          </>
        )}
      </div>

      {/* Demographics Section - Gender & Age side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4"> {/* Reduced gap and margin */}
        {data && (
          <>
            <GenderDistributionChart data={data.demographics.genderData} />
            <AgeDistributionChart data={data.demographics.ageData} />
          </>
        )}
      </div>

      {/* Upcoming Events Widget */}
      <div className="mt-4"> {/* Reduced from mt-6 */}
        <UpcomingEventsWidget />
      </div>
    </div>
  );
};

export default AdminDashboardPage;
