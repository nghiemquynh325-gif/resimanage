-- Migration: Create tables for Association Management
-- Quản lý Chi Hội: Hội CCB, Hội Phụ Nữ, Đoàn TN, Hội Chữ Thập Đỏ

-- Table: associations (Chi hội)
CREATE TABLE IF NOT EXISTS associations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type VARCHAR(50) NOT NULL UNIQUE CHECK (type IN ('veterans', 'women', 'youth', 'red_cross', 'discharged_military', 'party_member_213')),
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table: association_members (Thành viên chi hội)
CREATE TABLE IF NOT EXISTS association_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  association_id UUID NOT NULL REFERENCES associations(id) ON DELETE CASCADE,
  resident_id UUID NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('president', 'vice_president', 'member')),
  joined_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(association_id, resident_id) -- Một cư dân chỉ có thể tham gia 1 lần mỗi hội
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_association_members_association_id ON association_members(association_id);
CREATE INDEX IF NOT EXISTS idx_association_members_resident_id ON association_members(resident_id);
CREATE INDEX IF NOT EXISTS idx_association_members_role ON association_members(role);

-- Insert default associations (5 loại hội)
INSERT INTO associations (name, type, description) VALUES
  ('Hội Cựu Chiến Binh', 'veterans', 'Hội Cựu Chiến Binh khu phố'),
  ('Hội Phụ Nữ', 'women', 'Hội Liên hiệp Phụ nữ khu phố'),
  ('Đoàn Thanh Niên', 'youth', 'Đoàn Thanh niên Cộng sản Hồ Chí Minh'),
  ('Hội Chữ Thập Đỏ', 'red_cross', 'Hội Chữ thập đỏ khu phố'),
  ('Quân nhân xuất ngũ', 'discharged_military', 'Hội Quân nhân xuất ngũ khu phố'),
  ('Đảng viên 213', 'party_member_213', 'Đảng viên theo QĐ 213-QĐ/TW')
ON CONFLICT (type) DO NOTHING;

-- RLS Policies (if using Row Level Security)
-- ALTER TABLE associations ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE association_members ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Allow all operations for authenticated users" ON associations
--   FOR ALL USING (true);

-- CREATE POLICY "Allow all operations for authenticated users" ON association_members
--   FOR ALL USING (true);

COMMENT ON TABLE associations IS 'Danh sách các chi hội đoàn thể';
COMMENT ON TABLE association_members IS 'Thành viên của các chi hội';
COMMENT ON COLUMN association_members.role IS 'Vai trò: president (Chi hội trưởng), vice_president (Chi hội phó), member (Hội viên)';
