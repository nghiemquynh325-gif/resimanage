-- Create party_member_info table for storing party member information
-- This table is linked to association_members for Party Member 213 association

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: party_member_info (Thông tin đảng viên)
CREATE TABLE IF NOT EXISTS party_member_info (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  association_member_id UUID NOT NULL REFERENCES association_members(id) ON DELETE CASCADE,
  workplace TEXT, -- Đơn vị nơi công tác
  introduction_date DATE, -- Ngày giới thiệu
  party_join_date DATE, -- Ngày vào đảng
  official_date DATE, -- Ngày chính thức
  party_activities TEXT, -- Sinh hoạt tại chi, Đảng bộ nơi cư trú
  party_notes TEXT, -- Nhận xét của chi, đảng bộ nơi cư trú
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(association_member_id) -- Mỗi thành viên chỉ có 1 bản ghi thông tin đảng viên
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_party_member_info_member_id ON party_member_info(association_member_id);

-- Comments for documentation
COMMENT ON TABLE party_member_info IS 'Thông tin đảng viên theo QĐ 213-QĐ/TW';
COMMENT ON COLUMN party_member_info.workplace IS 'Đơn vị nơi công tác';
COMMENT ON COLUMN party_member_info.introduction_date IS 'Ngày giới thiệu';
COMMENT ON COLUMN party_member_info.party_join_date IS 'Ngày vào đảng';
COMMENT ON COLUMN party_member_info.official_date IS 'Ngày chính thức';
COMMENT ON COLUMN party_member_info.party_activities IS 'Sinh hoạt tại chi, Đảng bộ nơi cư trú';
COMMENT ON COLUMN party_member_info.party_notes IS 'Nhận xét của chi, đảng bộ nơi cư trú';
