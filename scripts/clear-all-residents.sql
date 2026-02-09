-- Script để xóa toàn bộ dữ liệu cư dân trong Supabase
-- CẢNH BÁO: Script này sẽ XÓA VĨNH VIỄN tất cả dữ liệu cư dân và hộ khẩu!
-- Hãy chắc chắn bạn đã backup dữ liệu trước khi chạy!

-- Bước 1: Xóa tất cả thành viên trong các hội (associations)
DELETE FROM association_members;

-- Bước 2: Xóa thông tin quân đội
DELETE FROM military_info;

-- Bước 3: Xóa thông tin đảng viên
DELETE FROM party_member_info;

-- Bước 4: Xóa tất cả thành viên hộ khẩu
DELETE FROM household_members;

-- Bước 5: Xóa tất cả hộ khẩu
DELETE FROM households;

-- Bước 6: Xóa tất cả cư dân
DELETE FROM residents;

-- Kiểm tra kết quả
SELECT 
  (SELECT COUNT(*) FROM residents) as total_residents,
  (SELECT COUNT(*) FROM households) as total_households,
  (SELECT COUNT(*) FROM household_members) as total_household_members,
  (SELECT COUNT(*) FROM association_members) as total_association_members,
  (SELECT COUNT(*) FROM military_info) as total_military_info,
  (SELECT COUNT(*) FROM party_member_info) as total_party_member_info;

-- Kết quả mong đợi: Tất cả đều phải là 0
