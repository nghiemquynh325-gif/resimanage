import { supabase } from './supabaseClient';
import { Resident } from '../types';

export interface ImportResult {
    success: number;
    failed: number;
    errors: Array<{ row: number; error: string }>;
}

/**
 * Batch insert residents into Supabase
 */
export const batchInsertResidents = async (
    residents: Partial<Resident>[]
): Promise<ImportResult> => {
    const result: ImportResult = {
        success: 0,
        failed: 0,
        errors: []
    };

    // Process in batches of 50 to avoid overwhelming the database
    const batchSize = 50;

    for (let i = 0; i < residents.length; i += batchSize) {
        const batch = residents.slice(i, i + batchSize);

        for (let j = 0; j < batch.length; j++) {
            const resident = batch[j];
            const rowNumber = i + j + 1;

            try {
                // Prepare resident data for Supabase residents table
                const residentData: any = {
                    full_name: resident.fullName,
                    email: resident.email || null,
                    dob: resident.dob, // Date of birth (required)
                    gender: resident.gender, // Required: Nam/Nữ/Khác
                    phone_number: resident.phoneNumber, // Required
                    address: resident.address, // Required
                    status: resident.status || 'pending_approval',
                    avatar: resident.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(resident.fullName || 'User')}&background=random&color=fff`,

                    // Optional fields
                    identity_card: resident.identityCard || null,
                    education: resident.education || null,
                    hometown: resident.hometown || null,
                    profession: resident.profession || null,
                    ethnicity: resident.ethnicity || 'Kinh',
                    religion: resident.religion || 'Không',
                    unit: resident.unit || null, // Tổ dân phố
                    province: resident.province || null,
                    ward: resident.ward || null,

                    // Party member info
                    is_party_member: resident.isPartyMember || false,
                    party_join_date: resident.partyJoinDate || null,

                    // Special status
                    special_status: resident.specialStatus || null,
                    special_notes: resident.specialNotes || null,

                    // Household info (will be set later if needed)
                    household_id: resident.householdId || null,
                    is_head_of_household: resident.isHeadOfHousehold || false
                };

                const { error } = await supabase
                    .from('residents')
                    .insert(residentData);

                if (error) {
                    throw error;
                }

                result.success++;
            } catch (error: any) {
                result.failed++;
                result.errors.push({
                    row: rowNumber,
                    error: error.message || 'Lỗi không xác định'
                });
            }
        }

        // Small delay between batches to avoid rate limiting
        if (i + batchSize < residents.length) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    return result;
};

/**
 * Check for duplicate phone numbers or emails in Supabase
 */
export const checkDuplicates = async (
    residents: Partial<Resident>[]
): Promise<{ duplicates: string[]; field: string }[]> => {
    const duplicates: { duplicates: string[]; field: string }[] = [];

    // Check phone numbers
    const phoneNumbers = residents
        .map(r => r.phoneNumber)
        .filter(p => p) as string[];

    if (phoneNumbers.length > 0) {
        const { data } = await supabase
            .from('residents')
            .select('phone_number')
            .in('phone_number', phoneNumbers);

        if (data && data.length > 0) {
            duplicates.push({
                duplicates: data.map(d => d.phone_number),
                field: 'phoneNumber'
            });
        }
    }

    // Check emails
    const emails = residents
        .map(r => r.email)
        .filter(e => e) as string[];

    if (emails.length > 0) {
        const { data } = await supabase
            .from('residents')
            .select('email')
            .in('email', emails);

        if (data && data.length > 0) {
            duplicates.push({
                duplicates: data.map(d => d.email),
                field: 'email'
            });
        }
    }

    return duplicates;
};
