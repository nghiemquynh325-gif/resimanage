-- Script để backup dữ liệu trước khi xóa
-- Tạo bảng backup để có thể khôi phục nếu cần

-- ============================================
-- TẠO BẢNG BACKUP
-- ============================================

-- Backup toàn bộ bảng residents
CREATE TABLE IF NOT EXISTS residents_backup AS 
SELECT * FROM residents;

-- Backup toàn bộ bảng households
CREATE TABLE IF NOT EXISTS households_backup AS 
SELECT * FROM households;

-- Backup toàn bộ bảng household_members
CREATE TABLE IF NOT EXISTS household_members_backup AS 
SELECT * FROM household_members;

-- Backup toàn bộ bảng association_members
CREATE TABLE IF NOT EXISTS association_members_backup AS 
SELECT * FROM association_members;


-- ============================================
-- KIỂM TRA BACKUP
-- ============================================

SELECT 
  (SELECT COUNT(*) FROM residents) as current_residents,
  (SELECT COUNT(*) FROM residents_backup) as backup_residents,
  (SELECT COUNT(*) FROM households) as current_households,
  (SELECT COUNT(*) FROM households_backup) as backup_households;


-- ============================================
-- KHÔI PHỤC TỪ BACKUP (nếu cần)
-- ============================================

-- Xóa dữ liệu hiện tại
TRUNCATE residents CASCADE;
TRUNCATE households CASCADE;

-- Khôi phục từ backup
INSERT INTO residents SELECT * FROM residents_backup;
INSERT INTO households SELECT * FROM households_backup;
INSERT INTO household_members SELECT * FROM household_members_backup;
INSERT INTO association_members SELECT * FROM association_members_backup;


-- ============================================
-- XÓA BẢNG BACKUP (sau khi đã chắc chắn)
-- ============================================

DROP TABLE IF EXISTS residents_backup;
DROP TABLE IF EXISTS households_backup;
DROP TABLE IF EXISTS household_members_backup;
DROP TABLE IF EXISTS association_members_backup;
