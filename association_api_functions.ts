// Association Management API Functions
// Add these functions to utils/mockApi.ts

import { supabase } from './supabaseClient';
import type { Association, AssociationMember, AssociationRole } from '../types';

// ============================================
// ASSOCIATION FUNCTIONS
// ============================================

/**
 * Get all associations (4 types: veterans, women, youth, red_cross)
 */
export async function getAssociations(): Promise<Association[]> {
    const { data, error } = await supabase
        .from('associations')
        .select('*')
        .order('type');

    if (error) throw error;
    return data || [];
}

/**
 * Get association by ID
 */
export async function getAssociationById(id: string): Promise<Association | null> {
    const { data, error } = await supabase
        .from('associations')
        .select('*')
        .eq('id', id)
        .single();

    if (error) throw error;
    return data;
}

// ============================================
// ASSOCIATION MEMBER FUNCTIONS
// ============================================

/**
 * Get all members of an association with resident details
 * Sorted by role: president -> vice_president -> member
 */
export async function getAssociationMembers(associationId: string): Promise<AssociationMember[]> {
    const { data, error } = await supabase
        .from('association_members')
        .select(`
      *,
      resident:residents(*)
    `)
        .eq('association_id', associationId)
        .order('role', { ascending: true }); // president < vice_president < member alphabetically

    if (error) throw error;

    // Custom sort to ensure correct order
    const sortedData = (data || []).sort((a, b) => {
        const roleOrder = { president: 1, vice_president: 2, member: 3 };
        return roleOrder[a.role as AssociationRole] - roleOrder[b.role as AssociationRole];
    });

    return sortedData;
}

/**
 * Add a resident to an association
 */
export async function addAssociationMember(
    associationId: string,
    residentId: string,
    role: AssociationRole = 'member'
): Promise<AssociationMember> {
    const { data, error } = await supabase
        .from('association_members')
        .insert({
            association_id: associationId,
            resident_id: residentId,
            role: role,
            joined_date: new Date().toISOString().split('T')[0]
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Update member role (e.g., promote to vice_president or president)
 */
export async function updateMemberRole(
    memberId: string,
    newRole: AssociationRole
): Promise<AssociationMember> {
    const { data, error } = await supabase
        .from('association_members')
        .update({
            role: newRole,
            updated_at: new Date().toISOString()
        })
        .eq('id', memberId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Remove a member from an association
 */
export async function removeMemberFromAssociation(memberId: string): Promise<void> {
    const { error } = await supabase
        .from('association_members')
        .delete()
        .eq('id', memberId);

    if (error) throw error;
}

/**
 * Check if a resident is already in an association
 */
export async function isResidentInAssociation(
    associationId: string,
    residentId: string
): Promise<boolean> {
    const { data, error } = await supabase
        .from('association_members')
        .select('id')
        .eq('association_id', associationId)
        .eq('resident_id', residentId)
        .maybeSingle();

    if (error) throw error;
    return !!data;
}

/**
 * Get all associations a resident belongs to
 */
export async function getResidentAssociations(residentId: string): Promise<Association[]> {
    const { data, error } = await supabase
        .from('association_members')
        .select(`
      association:associations(*)
    `)
        .eq('resident_id', residentId);

    if (error) throw error;
    return (data || []).map(item => item.association).filter(Boolean);
}

/**
 * Get member count for each association
 */
export async function getAssociationMemberCounts(): Promise<Record<string, number>> {
    const { data, error } = await supabase
        .from('association_members')
        .select('association_id');

    if (error) throw error;

    const counts: Record<string, number> = {};
    (data || []).forEach(member => {
        counts[member.association_id] = (counts[member.association_id] || 0) + 1;
    });

    return counts;
}
