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

    // Process in batches of 100 (increased from 50 for better performance)
    const batchSize = 100;

    for (let i = 0; i < residents.length; i += batchSize) {
        const batch = residents.slice(i, i + batchSize);

        try {
            // Prepare all resident data for this batch
            const batchData = batch.map((resident, j) => ({
                full_name: resident.fullName,
                email: resident.email || null,
                dob: resident.dob,
                gender: resident.gender,
                phone_number: resident.phoneNumber,
                address: resident.address,
                status: resident.status || 'pending_approval',
                avatar: resident.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(resident.fullName || 'User')}&background=random&color=fff`,

                // Optional fields
                identity_card: resident.identityCard || null,
                education: resident.education || null,
                hometown: resident.hometown || null,
                profession: resident.profession || null,
                ethnicity: resident.ethnicity || 'Kinh',
                religion: resident.religion || 'Không',
                unit: resident.unit || null,
                province: resident.province || null,
                ward: resident.ward || null,
                residence_type: resident.residenceType || null,

                // Party member info
                is_party_member: resident.isPartyMember || false,
                party_join_date: resident.partyJoinDate || null,

                // Special status
                special_status: resident.specialStatus || null,
                special_notes: resident.specialNotes || null,

                // Household info
                household_id: resident.householdId || null,
                is_head_of_household: resident.isHeadOfHousehold || false
            }));

            // Bulk insert the entire batch at once
            const { data, error } = await supabase
                .from('residents')
                .insert(batchData)
                .select();

            if (error) {
                // If batch insert fails, fall back to individual inserts to identify problematic rows
                console.warn(`Batch insert failed, falling back to individual inserts:`, error.message);

                for (let j = 0; j < batch.length; j++) {
                    const resident = batch[j];
                    const rowNumber = i + j + 1;

                    try {
                        const { error: individualError } = await supabase
                            .from('residents')
                            .insert(batchData[j]);

                        if (individualError) {
                            throw individualError;
                        }

                        result.success++;
                    } catch (err: any) {
                        result.failed++;
                        result.errors.push({
                            row: rowNumber,
                            error: err.message || 'Lỗi không xác định'
                        });
                    }
                }
            } else {
                // Batch insert succeeded
                result.success += data?.length || batch.length;
            }
        } catch (error: any) {
            // Unexpected error with the entire batch
            console.error('Batch processing error:', error);
            result.failed += batch.length;
            result.errors.push({
                row: i + 1,
                error: `Lỗi batch: ${error.message}`
            });
        }

        // Small delay between batches to avoid rate limiting (reduced from 100ms to 50ms)
        if (i + batchSize < residents.length) {
            await new Promise(resolve => setTimeout(resolve, 50));
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
