/**
 * @fileoverview Events API functions
 * Handles event-related operations
 */

import { supabase } from '../supabaseClient';

/**
 * Get upcoming events (next 30 days)
 */
export const getUpcomingEvents = async () => {
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    const { data, error } = await supabase
        .from('events')
        .select('*')
        .gte('date', now.toISOString())
        .lte('date', thirtyDaysFromNow.toISOString())
        .order('date', { ascending: true })
        .limit(5);

    if (error) {
        return [];
    }

    return data || [];
};
