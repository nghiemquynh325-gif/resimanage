/**
 * @fileoverview API Layer - Re-exports all API functions
 * 
 * This is the main entry point for all API calls.
 * Import from here instead of individual files.
 */

// Export from new modular structure
export * from './residents';
export * from './households';
export * from './events';
export * from './associations';
export * from './admin';
export * from './voting';
export * from './helpers';

// Still export dashboard functions from mockApi
export {
    // Dashboard
    getAdminStatsSummary,
    getAdminStatsDemographics,
} from '../mockApi';
