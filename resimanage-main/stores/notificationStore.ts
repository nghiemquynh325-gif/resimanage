
import { create } from 'zustand';
import { Notification } from '../types/notification';
import { fetchMock } from '../utils/mockApi';

/**
 * State definition for the Notification System.
 */
interface NotificationState {
  /** List of all notifications fetched from the server */
  notifications: Notification[];
  /** Count of unread notifications to display on the badge */
  unreadCount: number;
  /** Loading state for fetching notifications */
  isLoading: boolean;
  
  /** Fetches the full list of notifications */
  fetchNotifications: () => Promise<void>;
  /** 
   * Fetches only the count of unread notifications (lighter payload).
   * Designed to be polled periodically by the MainLayout.
   */
  fetchUnreadCount: () => Promise<void>;
  /** 
   * Marks a specific notification as read.
   * Updates local state immediately (Optimistic Update) for responsiveness.
   */
  markAsRead: (id: string) => void;
  /** Marks all notifications as read */
  markAllAsRead: () => void;
}

// Initial Mock Data - Empty
const MOCK_NOTIFICATIONS: Notification[] = [];

/**
 * Zustand store for Global Notifications.
 * Used by the NotificationBell component to poll and display updates.
 */
export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: MOCK_NOTIFICATIONS,
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async () => {
    set({ isLoading: true });
    // Simulate API Latency
    await new Promise(resolve => setTimeout(resolve, 500));
    set({ 
      notifications: MOCK_NOTIFICATIONS, 
      unreadCount: 0,
      isLoading: false 
    });
  },

  fetchUnreadCount: async () => {
    try {
      const response = await fetchMock('/api/notifications/unread-count');
      // Cast to any because fetchMock returns a union type where count is not guaranteed
      const res = response as any;
      if (res && typeof res.count === 'number') {
        set({ unreadCount: res.count });
      }
    } catch (error) {
      // Silent fail for background polling to avoid console noise
    }
  },

  markAsRead: (id: string) => {
    set((state) => {
      const updatedNotifications = state.notifications.map(n => 
        n.id === id ? { ...n, isRead: true } : n
      );
      return {
        notifications: updatedNotifications,
        unreadCount: Math.max(0, state.unreadCount - 1)
      };
    });
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map(n => ({ ...n, isRead: true })),
      unreadCount: 0
    }));
  }
}));
