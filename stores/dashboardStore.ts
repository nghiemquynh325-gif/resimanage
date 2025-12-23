import { create } from 'zustand';
import { DashboardStats } from '../types/dashboard';

/**
 * Dashboard State Interface
 * 
 * Manages the state for the Admin Dashboard, including statistics,
 * loading states, and error handling.
 * 
 * @interface DashboardState
 */
interface DashboardState {
  /** Dashboard statistics data (null when not loaded) */
  stats: DashboardStats | null;

  /** Indicates if dashboard data is currently being fetched */
  isLoading: boolean;

  /** Error message if dashboard data fetch fails */
  error: string | null;

  /** 
   * Updates the dashboard statistics
   * @param stats - New dashboard stats or null to clear
   */
  setStats: (stats: DashboardStats | null) => void;

  /**
   * Sets the loading state
   * @param isLoading - True when fetching data
   */
  setLoading: (isLoading: boolean) => void;

  /**
   * Sets the error state
   * @param error - Error message or null to clear
   */
  setError: (error: string | null) => void;
}

/**
 * Zustand Store for Admin Dashboard State
 * 
 * This store manages the global state for the admin dashboard,
 * including statistics, loading states, and errors.
 * 
 * **Usage Pattern:**
 * ```typescript
 * const { stats, isLoading, setStats, setLoading } = useDashboardStore();
 * 
 * // In useEffect or data fetching logic:
 * setLoading(true);
 * try {
 *   const data = await getDashboardStats();
 *   setStats(data);
 * } catch (error) {
 *   setError(error.message);
 * } finally {
 *   setLoading(false);
 * }
 * ```
 * 
 * @see {@link DashboardStats} for the structure of stats data
 */
export const useDashboardStore = create<DashboardState>((set) => ({
  stats: null,
  isLoading: false,
  error: null,
  setStats: (stats) => set({ stats }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
