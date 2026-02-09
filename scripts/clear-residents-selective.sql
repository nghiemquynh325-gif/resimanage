-- Script để xóa dữ liệu cư dân theo điều kiện
-- An toàn hơn so với xóa toàn bộ

-- ============================================
-- OPTION 1: Xóa cư dân theo trạng thái
-- ============================================

-- Xóa tất cả cư dân có trạng thái 'inactive'
DELETE FROM residents 
WHERE status = 'inactive';

-- Xóa tất cả cư dân có trạng thái 'pending_approval'
DELETE FROM residents 
WHERE status = 'pending_approval';

-- Xóa tất cả cư dân có trạng thái 'rejected'
DELETE FROM residents 
WHERE status = 'rejected';


-- ============================================
-- OPTION 2: Xóa cư dân theo ngày tạo
-- ============================================

-- Xóa cư dân được tạo trong ngày hôm nay
DELETE FROM residents 
WHERE DATE(created_at) = CURRENT_DATE;

-- Xóa cư dân được tạo trong 7 ngày qua
DELETE FROM residents 
WHERE created_at >= NOW() - INTERVAL '7 days';

-- Xóa cư dân được tạo trước một ngày cụ thể
DELETE FROM residents 
WHERE created_at < '2026-01-01';


-- ============================================
-- OPTION 3: Xóa cư dân theo đơn vị (Tổ)
-- ============================================

-- Xóa cư dân thuộc Tổ 1
DELETE FROM residents 
WHERE unit = 'Tổ 1';

-- Xóa cư dân không thuộc đơn vị nào
DELETE FROM residents 
WHERE unit IS NULL OR unit = '';


-- ============================================
-- OPTION 4: Xóa cư dân test/demo
-- ============================================

-- Xóa cư dân có email test
DELETE FROM residents 
WHERE email LIKE '%test%' OR email LIKE '%demo%';

-- Xóa cư dân có số điện thoại mặc định
DELETE FROM residents 
WHERE phone_number = '0000000000';


-- ============================================
-- OPTION 5: Xóa cư dân trùng lặp (giữ lại bản ghi mới nhất)
-- ============================================

-- Tìm và xóa cư dân trùng tên và ngày sinh (giữ lại ID lớn nhất)
DELETE FROM residents r1
WHERE EXISTS (
  SELECT 1 FROM residents r2
  WHERE r1.full_name = r2.full_name
    AND r1.dob = r2.dob
    AND r1.id < r2.id
);


-- ============================================
-- KIỂM TRA TRƯỚC KHI XÓA
-- ============================================

-- Xem số lượng bản ghi sẽ bị xóa theo điều kiện
SELECT COUNT(*) as will_be_deleted
FROM residents 
WHERE status = 'inactive'; -- Thay đổi điều kiện tùy theo nhu cầu

-- Xem chi tiết các bản ghi sẽ bị xóa
SELECT id, full_name, email, status, created_at
FROM residents 
WHERE status = 'inactive' -- Thay đổi điều kiện tùy theo nhu cầu
ORDER BY created_at DESC
LIMIT 100;
