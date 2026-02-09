/**
 * Script test để xem database schema chấp nhận fields nào
 */
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://etcwjkfiduzblrkdlzpp.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0Y3dqa2ZpZHV6Ymxya2RsenBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxMTA4NDQsImV4cCI6MjA4MTY4Njg0NH0.NIhwxPq0oUlWTiKfYn2PP5SfNfhiriKNQZyLfE2Hvfk';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testInsert() {
    console.log('Testing minimal insert...\n');

    // Test 1: snake_case
    const test1 = {
        full_name: 'TEST USER 1',
        phone_number: '0123456789'
    };

    console.log('Test 1: Minimal fields');
    console.log(JSON.stringify(test1, null, 2));

    const { data, error } = await supabase
        .from('residents')
        .insert([test1])
        .select();

    if (error) {
        console.log('❌ Error:', error.message);
    } else {
        console.log('✅ Success!');
        console.log('Inserted data:', JSON.stringify(data, null, 2));

        // Xóa test record
        await supabase.from('residents').delete().eq('id', data[0].id);
        console.log('\nTest record deleted.');
    }
}

testInsert();
