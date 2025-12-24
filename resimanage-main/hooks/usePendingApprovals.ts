import { useCallback } from 'react';
import { Resident } from '../types';
import { fetchMock, updateResident } from '../utils/mockApi';
import { useApi } from './useApi';

/**
 * Custom hook for managing pending resident approval requests.
 * 
 * Provides functionality to:
 * - Fetch pending approval requests
 * - Approve resident registrations
 * - Reject resident registrations with a reason
 * 
 * @returns {Object} Hook state and actions
 * @returns {Resident[]} pendingUsers - Array of residents awaiting approval
 * @returns {boolean} isLoading - Loading state indicator
 * @returns {string|null} error - Error message if fetch fails
 * @returns {Function} approveUser - Function to approve a user by ID
 * @returns {Function} rejectUser - Function to reject a user with reason
 * @returns {Function} refresh - Function to manually refresh the pending list
 * 
 * @example
 * const { pendingUsers, approveUser, rejectUser } = usePendingApprovals();
 * await approveUser('user-id-123');
 * await rejectUser('user-id-456', 'Invalid documents');
 */
export const usePendingApprovals = () => {
  const fetchPending = useCallback(async () => {
    // Use existing mock API with status filter
    const response = await fetchMock('/api/admin/residents?status=pending_approval&limit=100');
    if (response && Array.isArray(response.data)) {
      return response.data as Resident[];
    }
    return [] as Resident[];
  }, []);

  const { data: pendingUsers, isLoading, error, execute: refresh, setData } = useApi<Resident[]>(fetchPending, true);

  const approveUser = async (id: string) => {
    try {
      await updateResident(id, { status: 'active' });
      // Optimistic update
      if (pendingUsers) {
        setData(pendingUsers.filter(u => u.id !== id));
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Không thể phê duyệt' };
    }
  };

  const rejectUser = async (id: string, reason: string) => {
    try {
      await updateResident(id, {
        status: 'rejected',
        rejectionReason: reason
      });
      // Optimistic update
      if (pendingUsers) {
        setData(pendingUsers.filter(u => u.id !== id));
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Không thể từ chối' };
    }
  };

  return {
    pendingUsers: pendingUsers || [],
    isLoading,
    error,
    approveUser,
    rejectUser,
    refresh
  };
};
