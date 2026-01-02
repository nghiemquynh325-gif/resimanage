/**
 * @fileoverview Household API functions
 * Handles all household-related operations
 */

import { supabase } from '../supabaseClient';
import { Household } from '../../types';
import { KEYS } from './helpers';

// LocalStorage helpers
const getStorage = <T>(key: string, defaultValue: T): T => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch {
        return defaultValue;
    }
};

const setStorage = <T>(key: string, value: T): void => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // Ignore storage errors
    }
};

/**
 * Fetch all households with their members
 */
export const getHouseholds = async () => {
    const { data: householdsData, error: householdsError } = await supabase
        .from('households')
        .select('*')
        .order('created_at', { ascending: false });

    let householdsList = [];

    if (!householdsError && householdsData) {
        householdsList = householdsData;
    }

    // Fetch Household Members from DB with relationships
    const { data: membersData } = await supabase
        .from('household_members')
        .select('household_id, resident_id, relationship');

    const membersByHousehold: Record<string, string[]> = {};
    const relationshipsByHousehold: Record<string, Record<string, string>> = {};

    (membersData || []).forEach((member: any) => {
        if (!membersByHousehold[member.household_id]) {
            membersByHousehold[member.household_id] = [];
            relationshipsByHousehold[member.household_id] = {};
        }
        membersByHousehold[member.household_id].push(member.resident_id);
        if (member.relationship) {
            relationshipsByHousehold[member.household_id][member.resident_id] = member.relationship;
        }
    });

    // Filter out "Soft Deleted" households (Local Override)
    const deletedIds = getStorage<string[]>(KEYS.DELETED_HOUSEHOLDS, []);

    const households = householdsList
        .filter((h: any) => !deletedIds.includes(h.id))
        .map((h: any) => ({
            id: h.id,
            name: h.name,
            address: h.address,
            unit: h.unit,
            headOfHouseholdId: h.head_of_household_id || '',
            memberIds: membersByHousehold[h.id] || [],
            relationships: relationshipsByHousehold[h.id] || {},
            // Business household fields
            isBusiness: h.is_business || false,
            businessName: h.business_name,
            businessLicenseNumber: h.business_license_number,
            businessLicenseDate: h.business_license_date,
            businessOwnerId: h.business_owner_id,
            businessManagerId: h.business_manager_id,
            // Land certificate fields
            landPlotNumber: h.land_plot_number,
            landMapSheetNumber: h.land_map_sheet_number,
            certificateIssueNumber: h.certificate_issue_number,
            certificateRegistryNumber: h.certificate_registry_number,
            // Property details
            businessArea: h.business_area,
            businessConstructionYear: h.business_construction_year,
            businessFloors: h.business_floors,
            businessRooms: h.business_rooms,
            businessSector: h.business_sector,
            // Poor household fields
            isPoorHousehold: h.is_poor_household || false,
            poorHouseholdNotes: h.poor_household_notes,
            // Policy household fields
            isPolicyHousehold: h.is_policy_household || false,
            policyHouseholdNotes: h.policy_household_notes,
            createdAt: h.created_at
        }));

    return households;
};

/**
 * Create a new household
 */
export const createHousehold = async (data: Partial<Household>) => {
    const householdData: any = {
        name: data.name,
        address: data.address,
        unit: data.unit,
        head_of_household_id: data.headOfHouseholdId,
        // Business household fields
        is_business: data.isBusiness || false,
        business_name: data.businessName || null,
        business_license_number: data.businessLicenseNumber || null,
        business_license_date: data.businessLicenseDate || null,
        business_owner_id: data.businessOwnerId || null,
        business_manager_id: data.businessManagerId || null,
        // Land certificate fields
        land_plot_number: data.landPlotNumber || null,
        land_map_sheet_number: data.landMapSheetNumber || null,
        certificate_issue_number: data.certificateIssueNumber || null,
        certificate_registry_number: data.certificateRegistryNumber || null,
        // Property details
        business_area: data.businessArea || null,
        business_construction_year: data.businessConstructionYear || null,
        business_floors: data.businessFloors || null,
        business_rooms: data.businessRooms || null,
        business_sector: data.businessSector || null,
        // Poor household fields
        is_poor_household: data.isPoorHousehold || false,
        poor_household_notes: data.poorHouseholdNotes || null,
        // Policy household fields
        is_policy_household: data.isPolicyHousehold || false,
        policy_household_notes: data.policyHouseholdNotes || null
    };

    const { data: inserted, error } = await supabase.from('households').insert([householdData]).select().single();
    if (error) throw new Error(error.message);

    if (data.memberIds && data.memberIds.length > 0) {
        const memberRecords = data.memberIds
            .filter(residentId => residentId !== data.headOfHouseholdId) // Exclude head
            .map(residentId => ({
                household_id: inserted.id,
                resident_id: residentId,
                relationship: data.relationships?.[residentId] || null
            }));

        if (memberRecords.length > 0) {
            await supabase.from('household_members').insert(memberRecords);
        }
    }

    return inserted;
};

/**
 * Update an existing household
 */
export const updateHousehold = async (id: string, data: Partial<Household>) => {
    console.log('DEBUG: updateHousehold called', { id, data });
    const { data: currentMembers } = await supabase
        .from('household_members')
        .select('resident_id')
        .eq('household_id', id);

    const oldMemberIds = (currentMembers || []).map((m: any) => m.resident_id);
    const newMemberIds = (data.memberIds || oldMemberIds).filter(mid => mid !== data.headOfHouseholdId); // Exclude head

    const householdData: any = {
        name: data.name,
        address: data.address,
        unit: data.unit,
        head_of_household_id: data.headOfHouseholdId,
        // Business household fields
        is_business: data.isBusiness !== undefined ? data.isBusiness : false,
        business_name: data.businessName || null,
        business_license_number: data.businessLicenseNumber || null,
        business_license_date: data.businessLicenseDate || null,
        business_owner_id: data.businessOwnerId || null,
        business_manager_id: data.businessManagerId || null,
        // Land certificate fields
        land_plot_number: data.landPlotNumber || null,
        land_map_sheet_number: data.landMapSheetNumber || null,
        certificate_issue_number: data.certificateIssueNumber || null,
        certificate_registry_number: data.certificateRegistryNumber || null,
        // Property details
        business_area: data.businessArea || null,
        business_construction_year: data.businessConstructionYear || null,
        business_floors: data.businessFloors || null,
        business_rooms: data.businessRooms || null,
        business_sector: data.businessSector || null,
        // Poor household fields
        is_poor_household: data.isPoorHousehold !== undefined ? data.isPoorHousehold : false,
        poor_household_notes: data.poorHouseholdNotes || null,
        // Policy household fields
        is_policy_household: data.isPolicyHousehold !== undefined ? data.isPolicyHousehold : false,
        policy_household_notes: data.policyHouseholdNotes || null
    };

    const { data: updated, error } = await supabase
        .from('households')
        .update(householdData)
        .eq('id', id)
        .select()
        .single();

    if (error) throw new Error(error.message);

    const removedIds = oldMemberIds.filter((mid: string) => !newMemberIds.includes(mid));
    const addedIds = newMemberIds.filter((mid: string) => !oldMemberIds.includes(mid));

    if (removedIds.length > 0) {
        await supabase
            .from('household_members')
            .delete()
            .eq('household_id', id)
            .in('resident_id', removedIds);
    }

    if (addedIds.length > 0) {
        const memberRecords = addedIds.map(residentId => ({
            household_id: id,
            resident_id: residentId,
            relationship: data.relationships?.[residentId] || null
        }));

        await supabase
            .from('household_members')
            .insert(memberRecords);
    }

    // Update relationships for existing members
    if (data.relationships) {
        const existingMemberIds = oldMemberIds.filter((mid: string) => newMemberIds.includes(mid));

        // Strategy: Delete and Re-insert to avoid "No unique constraint" error with upsert
        // and "Bad Request" error with simple update if PK is not clear.

        // 1. Delete existing relationships for these members
        if (existingMemberIds.length > 0) {
            await supabase
                .from('household_members')
                .delete()
                .eq('household_id', id)
                .in('resident_id', existingMemberIds);

            // 2. Re-insert with updated relationships
            const insertData = existingMemberIds.map(residentId => ({
                household_id: id,
                resident_id: residentId,
                relationship: data.relationships?.[residentId] || null
            }));

            if (insertData.length > 0) {
                const { error: insertError } = await supabase
                    .from('household_members')
                    .insert(insertData);

                if (insertError) {
                    console.error('Error re-inserting member relationships:', insertError);
                    throw new Error(insertError.message);
                }
            }
        }
    }

    return updated;
};

/**
 * Delete a household
 */
export const deleteHousehold = async (id: string) => {
    // Try Real Delete via Supabase
    try {
        // 1. Unlink residents
        await supabase.from('residents').update({ household_id: null }).eq('household_id', id);
        // 2. Delete members
        await supabase.from('household_members').delete().eq('household_id', id);
        // 3. Delete household
        const { error } = await supabase.from('households').delete().eq('id', id);
        if (error) throw error;
    } catch (e) {
        // Backend delete failed - perform local soft-delete
    }

    // Force "Soft Delete" in Local Storage (Demo Mode Guarantee)
    const deletedIds = getStorage<string[]>(KEYS.DELETED_HOUSEHOLDS, []);
    if (!deletedIds.includes(id)) {
        deletedIds.push(id);
        setStorage(KEYS.DELETED_HOUSEHOLDS, deletedIds);
    }
};
