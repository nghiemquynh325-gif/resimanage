
import { useCallback } from 'react';
import {
  getAdminStatsSummary,
  getAdminStatsDemographics,
  getUpcomingEvents
} from '../utils/mockApi';
import {
  getResidenceTypeStats,
  getEthnicityStats,
  getReligionStats,
  getHouseholdCategoryStats
} from '../utils/dashboardStats';
import { Users, Home, Calendar, UserPlus } from 'lucide-react';
import { useApi } from './useApi';

interface DashboardData {
  statCards: Array<{
    id: string;
    title: string;
    value: number;
    icon: any;
    color: 'blue' | 'green' | 'orange' | 'purple' | 'red';
  }>;
  demographics: {
    genderData: Array<{ name: string; value: number }>;
    ageData: Array<{ name: string; count: number }>;
  };
  residenceTypes: Record<string, number>;
  ethnicities: Array<{ ethnicity: string; count: number }>;
  religions: Array<{ religion: string; count: number }>;
  householdCategories: {
    businessHouseholds: number;
    policyHouseholds: number;
    poorHouseholds: number;
    totalHouseholds: number;
  };
  upcomingEvents: any[];
}

/**
 * Custom hook for the Admin Dashboard.
 * 
 * Aggregation Strategy:
 * Uses `Promise.all` to fetch multiple data sources concurrently
 * 
 * Data Transformation:
 * Transforms raw API responses into UI-component-ready formats
 */
export const useAdminDashboard = () => {
  const fetchDashboardData = useCallback(async () => {
    // Fetch all required data concurrently
    const [stats, demographics, events, residenceTypes, ethnicities, religions, householdCategories] = await Promise.all([
      getAdminStatsSummary(),
      getAdminStatsDemographics(),
      getUpcomingEvents(),
      getResidenceTypeStats(),
      getEthnicityStats(),
      getReligionStats(),
      getHouseholdCategoryStats()
    ]);

    // Transform Stats into UI-ready Card format
    const statCards = [
      {
        id: 'residents',
        title: 'Tổng Cư dân',
        value: stats.totalResidents,
        icon: Users,
        color: 'blue' as const
      },
      {
        id: 'households',
        title: 'Hộ gia đình',
        value: stats.totalHouseholds,
        icon: Home,
        color: 'green' as const
      },
      {
        id: 'pending',
        title: 'Chờ duyệt',
        value: stats.pendingRequests,
        icon: UserPlus,
        color: 'orange' as const
      },
      {
        id: 'events',
        title: 'Sự kiện sắp tới',
        value: stats.upcomingEvents,
        icon: Calendar,
        color: 'purple' as const
      }
    ];

    return {
      statCards,
      demographics,
      residenceTypes,
      ethnicities,
      religions,
      householdCategories,
      upcomingEvents: events
    } as DashboardData;
  }, []);

  const { data, isLoading, error } = useApi<DashboardData>(fetchDashboardData, true);

  return { data, isLoading, error };
};
