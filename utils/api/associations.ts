/**
 * @fileoverview Associations API functions
 * Handles association and member management
 */

import { supabase } from '../supabaseClient';
import { mapResidentFromDb } from './helpers';

/**
 * Get all associations (4 types: veterans, women, youth, red_cross)
 */
export async function getAssociations() {
    const { data, error } = await supabase
        .from('associations')
        .select('*')
        .order('type');

    if (error) throw error;
    return data || [];
}

/**
 * Get all members of an association with resident details
 * Sorted by role: president -> vice_president -> member
 */
export async function getAssociationMembers(associationId: string) {
    const { data, error } = await supabase
        .from('association_members')
        .select(`
      *,
      resident:residents(*),
      military_info:military_info(*),
      party_member_info:party_member_info(*)
    `)
        .eq('association_id', associationId);

    if (error) throw error;

    // Map data and transform resident info
    const mappedData = (data || []).map((member: any) => ({
        id: member.id,
        associationId: member.association_id,
        residentId: member.resident_id,
        role: member.role,
        joinedDate: member.joined_date,
        createdAt: member.created_at,
        updatedAt: member.updated_at,
        // Map nested resident data
        resident: member.resident ? mapResidentFromDb(member.resident) : undefined,
        // Map military info if exists
        militaryInfo: member.military_info ? {
            id: member.military_info.id,
            associationMemberId: member.military_info.association_member_id,
            enlistmentDate: member.military_info.enlistment_date,
            dischargeDate: member.military_info.discharge_date,
            rank: member.military_info.rank,
            position: member.military_info.position,
            militarySpecialty: member.military_info.military_specialty,
            lastUnit: member.military_info.last_unit,
            createdAt: member.military_info.created_at,
            updatedAt: member.military_info.updated_at,
        } : undefined,
        // Map party member info if exists
        partyMemberInfo: member.party_member_info ? {
            id: member.party_member_info.id,
            associationMemberId: member.party_member_info.association_member_id,
            workplace: member.party_member_info.workplace,
            introductionDate: member.party_member_info.introduction_date,
            partyJoinDate: member.party_member_info.party_join_date,
            officialDate: member.party_member_info.official_date,
            partyActivities: member.party_member_info.party_activities,
            partyNotes: member.party_member_info.party_notes,
            createdAt: member.party_member_info.created_at,
            updatedAt: member.party_member_info.updated_at,
        } : undefined,
    }));

    // Sort by role priority
    const roleOrder = { president: 1, vice_president: 2, member: 3 };
    const sortedData = mappedData.sort((a, b) => {
        return roleOrder[a.role] - roleOrder[b.role];
    });

    return sortedData;
}

/**
 * Add a resident to an association
 */
export async function addAssociationMember(
    associationId: string,
    residentId: string,
    role: 'president' | 'vice_president' | 'member' = 'member'
) {
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
 * Add military information for a discharged military association member
 */
export async function addMilitaryInfo(
    associationMemberId: string,
    militaryData: {
        enlistmentDate?: string;
        dischargeDate?: string;
        rank?: string;
        position?: string;
        militarySpecialty?: string;
        lastUnit?: string;
    }
) {
    const { data, error } = await supabase
        .from('military_info')
        .insert({
            association_member_id: associationMemberId,
            enlistment_date: militaryData.enlistmentDate || null,
            discharge_date: militaryData.dischargeDate || null,
            rank: militaryData.rank || null,
            position: militaryData.position || null,
            military_specialty: militaryData.militarySpecialty || null,
            last_unit: militaryData.lastUnit || null,
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Add party member information for a party_member_213 association member
 */
export async function addPartyMemberInfo(
    associationMemberId: string,
    partyData: {
        workplace?: string;
        introductionDate?: string;
        partyJoinDate?: string;
        officialDate?: string;
        partyActivities?: string;
        partyNotes?: string;
    }
) {
    const { data, error } = await supabase
        .from('party_member_info')
        .insert({
            association_member_id: associationMemberId,
            workplace: partyData.workplace || null,
            introduction_date: partyData.introductionDate || null,
            party_join_date: partyData.partyJoinDate || null,
            official_date: partyData.officialDate || null,
            party_activities: partyData.partyActivities || null,
            party_notes: partyData.partyNotes || null,
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}
