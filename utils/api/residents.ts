/**
 * @fileoverview Resident API functions
 * Handles all resident-related operations
 */

import { supabase } from '../supabaseClient';
import { Resident } from '../../types';
import { mapResidentFromDb } from './helpers';

/**
 * Fetches paginated residents with filtering and search capabilities
 */
export const getResidents = async (params: any) => {
    let query = supabase.from('residents').select('*', { count: 'exact' });

    if (params.search) {
        const s = params.search.toLowerCase();
        query = query.or(`full_name.ilike.%${s}%,phone_number.ilike.%${s}%,address.ilike.%${s}%`);
    }

    if (params.status && params.status !== 'all') {
        if (params.status === 'active') {
            query = query.in('status', ['Thường trú', 'Tạm trú', 'Tạm trú có nhà', 'active']);
        } else {
            query = query.eq('status', params.status);
        }
    }

    if (params.ethnicity && params.ethnicity !== 'all') query = query.eq('ethnicity', params.ethnicity);
    if (params.religion && params.religion !== 'all') query = query.eq('religion', params.religion);

    // Gender Filter
    if (params.gender && params.gender !== 'all') {
        query = query.eq('gender', params.gender);
    }

    // Age Range Filter
    if (params.ageFrom || params.ageTo) {
        const currentYear = new Date().getFullYear();

        if (params.ageFrom) {
            const maxBirthYear = currentYear - params.ageFrom;
            query = query.lte('dob', `${maxBirthYear}-12-31`);
        }

        if (params.ageTo) {
            const minBirthYear = currentYear - params.ageTo;
            query = query.gte('dob', `${minBirthYear}-01-01`);
        }
    }

    if (params.specialFilter && params.specialFilter !== 'all') {
        if (params.specialFilter === 'party_member') {
            query = query.eq('is_party_member', true);
        } else if (params.specialFilter === 'special_notes') {
            query = query.not('special_notes', 'is', null).neq('special_notes', '');
        } else {
            query = query.eq('special_status', params.specialFilter);
        }
    }

    const page = params.page || 1;
    const limit = params.limit || 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, count, error } = await query.range(from, to).order('created_at', { ascending: false });

    if (error) {
        return { data: [], total: 0, totalPages: 0 };
    }

    const mappedData = (data || []).map(mapResidentFromDb);

    return {
        data: mappedData,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
    };
};

/**
 * Fetch all residents without pagination
 */
export const getAllResidents = async () => {
    const { data, error } = await supabase
        .from('residents')
        .select('*')
        .limit(100000);

    if (error) {
        return [];
    }
    return (data || []).map(mapResidentFromDb);
};

/**
 * Create a new resident
 */
export const createResident = async (data: Partial<Resident>) => {
    const newResident = {
        full_name: data.fullName,
        email: data.email,
        dob: data.dob,
        gender: data.gender,
        phone_number: data.phoneNumber,
        address: data.address,
        status: data.status || 'Thường trú',
        avatar: data.avatar || `https://ui-avatars.com/api/?name=${data.fullName}&background=random`,
        household_id: data.householdId,
        is_party_member: data.isPartyMember || false,
        party_join_date: data.partyJoinDate,
        identity_card: data.identityCard,
        education: data.education,
        hometown: data.hometown,
        profession: data.profession,
        ethnicity: data.ethnicity,
        religion: data.religion,
        unit: data.unit,
        province: data.province,
        ward: data.ward,
        residence_type: data.residenceType,
        is_head_of_household: data.isHeadOfHousehold || false,
        special_status: data.specialStatus,
        special_notes: data.specialNotes,
        rejection_reason: data.rejectionReason
    };

    const { data: inserted, error } = await supabase.from('residents').insert([newResident]).select().single();
    if (error) throw new Error(error.message);
    return mapResidentFromDb(inserted);
};

/**
 * Update an existing resident
 */
export const updateResident = async (id: string, updates: Partial<Resident>) => {
    const dbUpdates: any = {};

    if (updates.fullName !== undefined) dbUpdates.full_name = updates.fullName;
    if (updates.email !== undefined) dbUpdates.email = updates.email;
    if (updates.dob !== undefined) dbUpdates.dob = updates.dob;
    if (updates.gender !== undefined) dbUpdates.gender = updates.gender;
    if (updates.phoneNumber !== undefined) dbUpdates.phone_number = updates.phoneNumber;
    if (updates.address !== undefined) dbUpdates.address = updates.address;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.residenceType !== undefined) dbUpdates.residence_type = updates.residenceType;
    if (updates.avatar !== undefined) dbUpdates.avatar = updates.avatar;
    if (updates.householdId !== undefined) dbUpdates.household_id = updates.householdId;
    if (updates.isPartyMember !== undefined) dbUpdates.is_party_member = updates.isPartyMember;
    if (updates.partyJoinDate !== undefined) dbUpdates.party_join_date = updates.partyJoinDate;
    if (updates.identityCard !== undefined) dbUpdates.identity_card = updates.identityCard;
    if (updates.education !== undefined) dbUpdates.education = updates.education;
    if (updates.hometown !== undefined) dbUpdates.hometown = updates.hometown;
    if (updates.profession !== undefined) dbUpdates.profession = updates.profession;
    if (updates.ethnicity !== undefined) dbUpdates.ethnicity = updates.ethnicity;
    if (updates.religion !== undefined) dbUpdates.religion = updates.religion;
    if (updates.unit !== undefined) dbUpdates.unit = updates.unit;
    if (updates.province !== undefined) dbUpdates.province = updates.province;
    if (updates.ward !== undefined) dbUpdates.ward = updates.ward;
    if (updates.isHeadOfHousehold !== undefined) dbUpdates.is_head_of_household = updates.isHeadOfHousehold;
    if (updates.specialStatus !== undefined) dbUpdates.special_status = updates.specialStatus;
    if (updates.specialNotes !== undefined) dbUpdates.special_notes = updates.specialNotes;
    if (updates.rejectionReason !== undefined) dbUpdates.rejection_reason = updates.rejectionReason;

    const { data, error } = await supabase.from('residents').update(dbUpdates).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return mapResidentFromDb(data);
};

/**
 * Delete a resident
 */
export const deleteResident = async (id: string) => {
    // Remove from any household_members
    await supabase.from('household_members').delete().eq('resident_id', id);

    // Delete the resident
    const { error } = await supabase.from('residents').delete().eq('id', id);
    if (error) throw new Error(error.message);
};

/**
 * Toggle vote status for a resident
 */
export const toggleVote = async (residentId: string) => {
    const { data: resident, error: fetchError } = await supabase
        .from('residents')
        .select('has_voted')
        .eq('id', residentId)
        .single();

    if (fetchError) throw new Error(fetchError.message);

    const newVoteStatus = !resident.has_voted;

    const { error: updateError } = await supabase
        .from('residents')
        .update({ has_voted: newVoteStatus })
        .eq('id', residentId);

    if (updateError) throw new Error(updateError.message);

    return newVoteStatus;
};
