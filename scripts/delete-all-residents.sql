-- Script để xóa TOÀN BỘ dữ liệu cư dân
-- ⚠️ CẢNH BÁO: Script này sẽ XÓA VĨNH VIỄN tất cả dữ liệu cư dân!
-- Hãy chắc chắn bạn đã backup dữ liệu trước khi chạy!

-- Bước 1: Xóa các bảng liên quan trước (để tránh lỗi foreign key constraint)

-- Xóa thông tin đảng viên
DELETE FROM party_member_info;

-- Xóa thông tin quân đội
DELETE FROM military_info;

-- Xóa thành viên chi hội
DELETE FROM association_members;

-- Xóa thành viên hộ gia đình
DELETE FROM household_members;

-- Bước 2: Xóa cư dân
DELETE FROM residents;

-- Bước 3: Xóa hộ gia đình (nếu muốn)
-- DELETE FROM households;

-- Bước 4: Reset auto-increment ID (tùy chọn)
-- Nếu bạn muốn ID bắt đầu lại từ 1
-- ALTER SEQUENCE residents_id_seq RESTART WITH 1;
-- ALTER SEQUENCE households_id_seq RESTART WITH 1;

-- Kiểm tra kết quả
SELECT COUNT(*) as total_residents FROM residents;
SELECT COUNT(*) as total_households FROM households;
SELECT COUNT(*) as total_household_members FROM household_members;
SELECT COUNT(*) as total_association_members FROM association_members;

-- Kết quả mong đợi: total_residents = 0
