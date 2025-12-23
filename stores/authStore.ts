
import { create } from 'zustand';
import { User } from '../types/user';
import { Role } from '../types';
// Remove Supabase dependency for now to prevent backend errors
// import { supabase } from '../utils/supabaseClient';
import { logoutUser, loadUserSession, loginMock } from '../utils/mockApi';

/**
 * Interface defining the Authentication State and Actions.
 * Managed via Zustand.
 */
interface AuthState {
  /** The currently logged-in user profile, or null if unauthenticated. */
  user: User | null;
  
  /** 
   * Global authentication flag.
   * Used by ProtectedRoute to allow/deny access.
   */
  isAuthenticated: boolean;
  
  /** Indicates if an auth operation (login/logout/check) is in progress. */
  isLoading: boolean;
  
  /** Stores the last error message from auth operations. */
  error: string | null;
  
  /**
   * Authenticates a user.
   * 
   * @param email - User's email
   * @param password - User's password
   * @param role - The role the user is attempting to login as
   */
  login: (email: string, password: string, role: Role) => Promise<void>;
  
  /**
   * Logs out the current user, clears session storage, and resets state.
   */
  logout: () => Promise<void>;
  
  /**
   * Initializer: Checks for an existing session (LocalStorage) on app startup.
   * Essential for persisting login state across page reloads.
   */
  loadSession: () => Promise<void>;
  
  /**
   * Updates the local user state (e.g., after profile editing) without re-fetching.
   * @param updates - Partial user object with fields to update
   */
  updateUser: (updates: Partial<User>) => void;
  
  /** Deprecated alias for loadSession, kept for compatibility if needed */
  initialize: () => Promise<void>;
}

/**
 * Zustand store for managing global authentication state.
 * Handles login, logout, and session persistence logic via Mock API.
 */
export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start loading to check session on mount
  error: null,

  login: async (email, password, role) => {
    set({ isLoading: true, error: null });
    
    try {
      // Use Local Mock Auth instead of Supabase
      const user = await loginMock(email, password, role);
      set({ user, isAuthenticated: true });
    } catch (error: any) {
      set({ error: error.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      // Clear mock session artifacts
      await logoutUser();
      
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      set({ user: null, isAuthenticated: false }); 
    } finally {
      set({ isLoading: false });
    }
  },

  loadSession: async () => {
    set({ isLoading: true });
    try {
      // Check Mock Local Session
      const user = await loadUserSession();
      
      if (user) {
        set({ user, isAuthenticated: true });
      } else {
        set({ user: null, isAuthenticated: false });
      }
    } catch (error) {
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },

  updateUser: (updates: Partial<User>) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null
    }));
  },

  // Alias for compatibility
  initialize: async () => {
    return get().loadSession();
  }
}));
