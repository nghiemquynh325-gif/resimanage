/**
 * @fileoverview Voting API functions
 * Handles voting statistics and operations
 */

import { supabase } from '../supabaseClient';

/**
 * Get voting statistics grouped by Tổ - WITH PAGINATION
 * Bypasses Supabase 1000-row limit
 */
export const getVotingStats = async () => {
    let allData: any[] = [];
    let page = 0;
    const pageSize = 1000;
    let hasMore = true;

    // Fetch ALL residents using pagination
    while (hasMore) {
        const start = page * pageSize;
        const end = start + pageSize - 1;

        const { data, error } = await supabase
            .from('residents')
            .select('unit, has_voted')
            .range(start, end);

        if (error) {
            throw new Error(error.message);
        }

        if (data && data.length > 0) {
            allData = [...allData, ...data];
            page++;
            hasMore = data.length === pageSize;
        } else {
            hasMore = false;
        }
    }

    // Group by Tổ and calculate stats
    const stats: Record<string, { total: number; voted: number; percentage: number }> = {};

    allData.forEach((resident: any) => {
        const group = resident.unit || 'Không có tổ';

        if (!stats[group]) {
            stats[group] = { total: 0, voted: 0, percentage: 0 };
        }

        stats[group].total++;
        if (resident.has_voted) {
            stats[group].voted++;
        }
    });

    // Calculate percentages
    Object.keys(stats).forEach(group => {
        const { total, voted } = stats[group];
        stats[group].percentage = total > 0 ? Math.round((voted / total) * 100) : 0;
    });

    return stats;
};
