/**
 * @fileoverview Admin API functions
 * Handles admin staff management and user profile updates
 */

import { supabase } from '../supabaseClient';
import { Resident } from '../../types';
import { updateResident } from './residents';

/**
 * Register a new admin staff member
 */
export const registerAdminStaff = async (data: {
    fullName: string;
    email: string;
    phoneNumber?: string;
    identityCard?: string;
    position?: string;
    department?: string;
    password: string;
}) => {
    const { data: inserted, error } = await supabase
        .from('admin_staff')
        .insert([{
            full_name: data.fullName,
            email: data.email,
            phone_number: data.phoneNumber,
            identity_card: data.identityCard,
            position: data.position,
            department: data.department,
            password: data.password,
            status: 'pending_approval'
        }])
        .select()
        .single();

    if (error) throw new Error(error.message);
    return inserted;
};

/**
 * Approve an admin staff registration
 */
export const approveAdminStaff = async (id: string) => {
    const { data, error } = await supabase
        .from('admin_staff')
        .update({ status: 'approved' })
        .eq('id', id)
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
};

/**
 * Reject an admin staff registration
 */
export const rejectAdminStaff = async (id: string, reason: string) => {
    const { data, error } = await supabase
        .from('admin_staff')
        .update({
            status: 'rejected',
            rejection_reason: reason
        })
        .eq('id', id)
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
};

/**
 * Update user profile (delegates to updateResident)
 */
export const updateUserProfile = async (id: string, updates: Partial<Resident>) => {
    return await updateResident(id, updates);
};

/**
 * Change password (placeholder implementation)
 */
export const changePassword = async (id: string, oldPass: string, newPass: string) => true;
