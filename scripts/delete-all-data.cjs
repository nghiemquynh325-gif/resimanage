/**
 * Script để xóa toàn bộ dữ liệu residents qua API
 */
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://etcwjkfiduzblrkdlzpp.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0Y3dqa2ZpZHV6Ymxya2RsenBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxMTA4NDQsImV4cCI6MjA4MTY4Njg0NH0.NIhwxPq0oUlWTiKfYn2PP5SfNfhiriKNQZyLfE2Hvfk';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function deleteAllResidents() {
    console.log('Đang xóa toàn bộ dữ liệu cư dân...\n');

    // Xóa theo thứ tự để tránh lỗi foreign key
    const tables = [
        'association_members',
        'military_info',
        'party_member_info',
        'household_members',
        'households',
        'residents'
    ];

    for (const table of tables) {
        console.log(`Đang xóa ${table}...`);
        const { error, count } = await supabase
            .from(table)
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

        if (error) {
            console.error(`Lỗi khi xóa ${table}:`, error.message);
        } else {
            console.log(`✓ Đã xóa ${table}`);
        }
    }

    // Verify
    console.log('\n=== KIỂM TRA ===');
    for (const table of tables) {
        const { count, error } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true });

        if (!error) {
            console.log(`${table}: ${count} bản ghi`);
        }
    }

    console.log('\n✓ Hoàn tất xóa dữ liệu!');
}

deleteAllResidents();
