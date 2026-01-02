import { supabase } from './supabaseClient';

// ============================================================================
// Dashboard Statistics Functions
// ============================================================================

/**
 * Get residence type statistics
 * Returns count for each residence type
 */
export const getResidenceTypeStats = async () => {
    const { data, error } = await supabase
        .from('residents')
        .select('residence_type')
        .eq('status', 'active');

    if (error) throw new Error(error.message);

    const stats: Record<string, number> = {
        'Thường trú': 0,
        'Tạm trú': 0,
        'Tạm trú có nhà': 0,
        'Tạm vắng': 0,
    };

    data?.forEach((resident: any) => {
        const type = resident.residence_type || 'Thường trú';
        if (stats[type] !== undefined) {
            stats[type]++;
        }
    });

    return stats;
};

/**
 * Get ethnicity distribution statistics
 */
export const getEthnicityStats = async () => {
    const { data, error } = await supabase
        .from('residents')
        .select('ethnicity')
        .eq('status', 'active');

    if (error) throw new Error(error.message);

    const ethnicityMap: Record<string, number> = {};

    data?.forEach((resident: any) => {
        const ethnicity = resident.ethnicity || 'Không xác định';
        ethnicityMap[ethnicity] = (ethnicityMap[ethnicity] || 0) + 1;
    });

    const ethnicityStats = Object.entries(ethnicityMap)
        .map(([ethnicity, count]) => ({ ethnicity, count }))
        .sort((a, b) => b.count - a.count);

    return ethnicityStats;
};

/**
 * Get religion distribution statistics
 */
export const getReligionStats = async () => {
    const { data, error } = await supabase
        .from('residents')
        .select('religion')
        .eq('status', 'active');

    if (error) throw new Error(error.message);

    const religionMap: Record<string, number> = {};

    data?.forEach((resident: any) => {
        const religion = resident.religion || 'Không';
        religionMap[religion] = (religionMap[religion] || 0) + 1;
    });

    const religionStats = Object.entries(religionMap)
        .map(([religion, count]) => ({ religion, count }))
        .sort((a, b) => b.count - a.count);

    return religionStats;
};

/**
 * Get household category statistics
 */
export const getHouseholdCategoryStats = async () => {
    const { data, error } = await supabase
        .from('households')
        .select('is_business, is_policy_household, is_poor_household');

    if (error) throw new Error(error.message);

    const stats = {
        businessHouseholds: 0,
        policyHouseholds: 0,
        poorHouseholds: 0,
        totalHouseholds: data?.length || 0,
    };

    data?.forEach((household: any) => {
        if (household.is_business) stats.businessHouseholds++;
        if (household.is_policy_household) stats.policyHouseholds++;
        if (household.is_poor_household) stats.poorHouseholds++;
    });

    return stats;
};
