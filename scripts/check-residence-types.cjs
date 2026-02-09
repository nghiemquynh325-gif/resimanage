/**
 * Script kiểm tra phân bố loại hình cư trú
 */
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://etcwjkfiduzblrkdlzpp.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0Y3dqa2ZpZHV6Ymxya2RsenBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxMTA4NDQsImV4cCI6MjA4MTY4Njg0NH0.NIhwxPq0oUlWTiKfYn2PP5SfNfhiriKNQZyLfE2Hvfk';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkResidenceTypes() {
    console.log('=== KIỂM TRA LOẠI HÌNH CƯ TRÚ ===\n');

    // Get all unique residence types
    const { data, error } = await supabase
        .from('residents')
        .select('residence_type');

    if (error) {
        console.error('Lỗi:', error.message);
        return;
    }

    // Count by type
    const counts = {};
    data.forEach(r => {
        const type = r.residence_type || 'null';
        counts[type] = (counts[type] || 0) + 1;
    });

    console.log('Phân bố loại hình cư trú:\n');
    Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .forEach(([type, count]) => {
            const percent = ((count / data.length) * 100).toFixed(2);
            console.log(`  ${type}: ${count} (${percent}%)`);
        });

    console.log(`\nTổng: ${data.length} cư dân`);
}

checkResidenceTypes();
