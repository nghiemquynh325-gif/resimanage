
import { useEffect, useCallback } from 'react';
import { fetchMock } from '../utils/mockApi';
import { useApi } from './useApi';
import { Resident } from '../types';

interface UseResidentsParams {
  page: number;
  limit: number;
  search: string;
  status: string;
}

interface ResidentsResponse {
  data: Resident[];
  totalPages: number;
  total: number;
}

export const useResidents = ({ page, limit, search, status }: UseResidentsParams) => {
  const fetchResidents = useCallback(async () => {
    // Construct query string
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search: search,
      status: status
    });

    const response = await fetchMock(`/api/admin/residents?${queryParams.toString()}`);
    
    // Handle the structured response from mockApi
    // Cast to any to handle flexible mock response structure
    const res = response as any;

    if (res && Array.isArray(res.data)) {
      return {
        data: res.data,
        totalPages: res.totalPages || 1,
        total: res.total || 0
      } as ResidentsResponse;
    }
    return { data: [], totalPages: 1, total: 0 } as ResidentsResponse;
  }, [page, limit, search, status]);

  const { data, isLoading, error, execute: refresh } = useApi<ResidentsResponse>(fetchResidents);

  // Trigger fetch when dependencies change
  useEffect(() => {
    refresh();
  }, [refresh]);

  return { 
    residents: data?.data || [], 
    totalPages: data?.totalPages || 1, 
    totalRecords: data?.total || 0, 
    isLoading, 
    error, 
    refresh 
  };
};
