-- Script để xóa TOÀN BỘ dữ liệu cư dân
-- CẢNH BÁO: Script này sẽ xóa vĩnh viễn tất cả dữ liệu!

-- Xóa theo thứ tự để tránh lỗi foreign key
DELETE FROM association_members;
DELETE FROM military_info;
DELETE FROM party_member_info;
DELETE FROM household_members;
DELETE FROM households;
DELETE FROM residents;

-- Verify
SELECT 'residents' as table_name, COUNT(*) as count FROM residents
UNION ALL
SELECT 'households', COUNT(*) FROM households
UNION ALL
SELECT 'household_members', COUNT(*) FROM household_members
UNION ALL
SELECT 'association_members', COUNT(*) FROM association_members;
