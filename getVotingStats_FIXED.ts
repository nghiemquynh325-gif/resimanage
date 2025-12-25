/**
 * FIXED VERSION - Get voting statistics with pagination
 * This bypasses the 1000-row Supabase limit
 */
export const getVotingStats = async () => {
    console.log('🔍 Fetching voting stats with pagination...');

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
            console.error('Error fetching page', page, error);
            throw new Error(error.message);
        }

        if (data && data.length > 0) {
            allData = [...allData, ...data];
            console.log(`📄 Page ${page + 1}: Fetched ${data.length} residents (Total: ${allData.length})`);
            page++;
            hasMore = data.length === pageSize; // Continue if we got full page
        } else {
            hasMore = false;
        }
    }

    console.log(`✅ Total residents fetched: ${allData.length}`);

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

    console.log('📊 Final stats:', stats);
    return stats;
};
