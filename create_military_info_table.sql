-- Create military_info table for storing military service information
-- This table is linked to association_members and stores data for discharged military personnel

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: military_info (Thông tin quân sự)
CREATE TABLE IF NOT EXISTS military_info (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  association_member_id UUID NOT NULL REFERENCES association_members(id) ON DELETE CASCADE,
  enlistment_date DATE, -- Ngày nhập ngũ
  discharge_date DATE, -- Ngày xuất ngũ
  rank TEXT, -- Cấp bậc (e.g., Hạ sĩ, Trung sĩ, Thượng sĩ, Thiếu úy, etc.)
  position TEXT, -- Chức vụ (e.g., Tiểu đội trưởng, Trung đội phó, etc.)
  military_specialty TEXT, -- Chuyên nghiệp quân sự (e.g., Bộ binh, Pháo binh, Thông tin, etc.)
  last_unit TEXT, -- Đơn vị trước khi xuất ngũ
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(association_member_id) -- Mỗi thành viên chỉ có 1 bản ghi thông tin quân sự
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_military_info_member_id ON military_info(association_member_id);

-- Comments for documentation
COMMENT ON TABLE military_info IS 'Thông tin quân sự của thành viên Hội Quân nhân xuất ngũ';
COMMENT ON COLUMN military_info.enlistment_date IS 'Ngày nhập ngũ';
COMMENT ON COLUMN military_info.discharge_date IS 'Ngày xuất ngũ';
COMMENT ON COLUMN military_info.rank IS 'Cấp bậc quân đội';
COMMENT ON COLUMN military_info.position IS 'Chức vụ trong quân đội';
COMMENT ON COLUMN military_info.military_specialty IS 'Chuyên nghiệp quân sự';
COMMENT ON COLUMN military_info.last_unit IS 'Đơn vị trước khi xuất ngũ';
