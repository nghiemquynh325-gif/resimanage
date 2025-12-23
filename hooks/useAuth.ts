import { useCallback } from 'react';
import { useAuthStore } from '../stores/authStore';
import { Role } from '../types';
import { User } from '../types/user';

/**
 * Custom hook that provides authentication functionality.
 * 
 * This hook wraps the Zustand authStore and provides memoized callbacks
 * for authentication operations. It's the recommended way to interact
 * with authentication state in components.
 * 
 * @returns {Object} Authentication state and methods
 * @returns {User|null} user - Currently authenticated user or null
 * @returns {boolean} isAuthenticated - Whether user is logged in
 * @returns {boolean} isLoading - Loading state for auth operations
 * @returns {string|null} error - Error message from last auth operation
 * @returns {Function} login - Login function (email, password, role)
 * @returns {Function} logout - Logout function
 * @returns {Function} loadSession - Load session from storage
 * @returns {Function} updateUser - Update user profile locally
 * 
 * @example
 * const { user, login, logout, isAuthenticated } = useAuth();
 * 
 * // Login
 * await login('user@example.com', 'password', 'RESIDENT');
 * 
 * // Logout
 * await logout();
 */
export const useAuth = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    login: loginAction,
    logout: logoutAction,
    loadSession: loadSessionAction,
    updateUser: updateUserAction
  } = useAuthStore();

  const login = useCallback(async (email: string, pass: string, role: Role) => {
    await loginAction(email, pass, role);
  }, [loginAction]);

  const logout = useCallback(async () => {
    await logoutAction();
  }, [logoutAction]);

  const loadSession = useCallback(async () => {
    await loadSessionAction();
  }, [loadSessionAction]);

  const updateUser = useCallback((updates: Partial<User>) => {
    updateUserAction(updates);
  }, [updateUserAction]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    loadSession,
    updateUser
  };
};
