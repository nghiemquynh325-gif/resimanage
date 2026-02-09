/**
 * Script Node.js để xóa TOÀN BỘ dữ liệu cư dân từ Supabase
 * ⚠️ CẢNH BÁO: Script này sẽ XÓA VĨNH VIỄN tất cả dữ liệu!
 * 
 * Cách sử dụng:
 * node scripts/delete-all-residents.cjs
 */

const { createClient } = require('@supabase/supabase-js');

// Cấu hình Supabase
const SUPABASE_URL = 'https://etcwjkfiduzblrkdlzpp.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0Y3dqa2ZpZHV6Ymxya2RsenBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxMTA4NDQsImV4cCI6MjA4MTY4Njg0NH0.NIhwxPq0oUlWTiKfYn2PP5SfNfhiriKNQZyLfE2Hvfk';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function deleteAllResidents() {
    console.log('⚠️  CẢNH BÁO: Bạn sắp XÓA TOÀN BỘ dữ liệu cư dân!');
    console.log('⚠️  Hành động này KHÔNG THỂ HOÀN TÁC!');
    console.log('');
    console.log('Đang đếm số lượng dữ liệu hiện tại...');

    try {
        // Đếm số lượng trước khi xóa
        const { count: residentCount } = await supabase
            .from('residents')
            .select('*', { count: 'exact', head: true });

        const { count: householdCount } = await supabase
            .from('households')
            .select('*', { count: 'exact', head: true });

        const { count: memberCount } = await supabase
            .from('household_members')
            .select('*', { count: 'exact', head: true });

        console.log(`📊 Thống kê hiện tại:`);
        console.log(`   - Cư dân: ${residentCount}`);
        console.log(`   - Hộ gia đình: ${householdCount}`);
        console.log(`   - Thành viên hộ: ${memberCount}`);
        console.log('');

        if (residentCount === 0) {
            console.log('✅ Không có dữ liệu cư dân nào để xóa.');
            return;
        }

        console.log('🗑️  Bắt đầu xóa dữ liệu...');
        console.log('');

        // Bước 1: Xóa thông tin đảng viên
        console.log('1️⃣  Xóa thông tin đảng viên...');
        const { error: partyError } = await supabase
            .from('party_member_info')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

        if (partyError) {
            console.log('   ⚠️  Lỗi khi xóa party_member_info:', partyError.message);
        } else {
            console.log('   ✅ Đã xóa thông tin đảng viên');
        }

        // Bước 2: Xóa thông tin quân đội
        console.log('2️⃣  Xóa thông tin quân đội...');
        const { error: militaryError } = await supabase
            .from('military_info')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000');

        if (militaryError) {
            console.log('   ⚠️  Lỗi khi xóa military_info:', militaryError.message);
        } else {
            console.log('   ✅ Đã xóa thông tin quân đội');
        }

        // Bước 3: Xóa thành viên chi hội
        console.log('3️⃣  Xóa thành viên chi hội...');
        const { error: assocError } = await supabase
            .from('association_members')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000');

        if (assocError) {
            console.log('   ⚠️  Lỗi khi xóa association_members:', assocError.message);
        } else {
            console.log('   ✅ Đã xóa thành viên chi hội');
        }

        // Bước 4: Xóa thành viên hộ gia đình
        console.log('4️⃣  Xóa thành viên hộ gia đình...');
        const { error: memberError } = await supabase
            .from('household_members')
            .delete()
            .neq('household_id', '00000000-0000-0000-0000-000000000000');

        if (memberError) {
            console.log('   ⚠️  Lỗi khi xóa household_members:', memberError.message);
        } else {
            console.log('   ✅ Đã xóa thành viên hộ gia đình');
        }

        // Bước 5: Xóa cư dân
        console.log('5️⃣  Xóa cư dân...');
        const { error: residentError } = await supabase
            .from('residents')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000');

        if (residentError) {
            console.error('   ❌ Lỗi khi xóa residents:', residentError.message);
            throw residentError;
        } else {
            console.log('   ✅ Đã xóa tất cả cư dân');
        }

        // Bước 6: Xóa hộ gia đình (tùy chọn)
        console.log('6️⃣  Xóa hộ gia đình...');
        const { error: householdError } = await supabase
            .from('households')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000');

        if (householdError) {
            console.log('   ⚠️  Lỗi khi xóa households:', householdError.message);
        } else {
            console.log('   ✅ Đã xóa tất cả hộ gia đình');
        }

        console.log('');
        console.log('✅ Hoàn tất! Tất cả dữ liệu cư dân đã được xóa.');
        console.log('');

        // Kiểm tra lại
        const { count: finalCount } = await supabase
            .from('residents')
            .select('*', { count: 'exact', head: true });

        console.log(`📊 Kết quả:`);
        console.log(`   - Số cư dân còn lại: ${finalCount}`);
        console.log('');

        if (finalCount === 0) {
            console.log('🎉 Database đã sạch sẽ! Bạn có thể import dữ liệu mới.');
        } else {
            console.log('⚠️  Vẫn còn một số dữ liệu. Vui lòng kiểm tra lại.');
        }

    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        process.exit(1);
    }
}

// Chạy script
deleteAllResidents();
