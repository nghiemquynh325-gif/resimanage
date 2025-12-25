-- Quick setup script for military info feature
-- Run this in Supabase SQL Editor

-- Step 1: Create military_info table
CREATE TABLE IF NOT EXISTS military_info (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  association_member_id UUID NOT NULL REFERENCES association_members(id) ON DELETE CASCADE,
  enlistment_date DATE,
  discharge_date DATE,
  rank TEXT,
  position TEXT,
  military_specialty TEXT,
  last_unit TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(association_member_id)
);

CREATE INDEX IF NOT EXISTS idx_military_info_member_id ON military_info(association_member_id);

-- Step 2: Insert "Quân nhân xuất ngũ" association if not exists
INSERT INTO associations (name, type, description) VALUES
  ('Quân nhân xuất ngũ', 'discharged_military', 'Hội Quân nhân xuất ngũ khu phố')
ON CONFLICT (type) DO NOTHING;

-- Step 3: (Optional) Add sample military info for testing
-- First, you need to add a member to discharged_military association via UI
-- Then you can insert military info like this:
-- INSERT INTO military_info (association_member_id, rank, position, enlistment_date, discharge_date, military_specialty, last_unit)
-- VALUES ('member-id-here', 'Trung sĩ', 'Tiểu đội trưởng', '2010-01-15', '2015-12-20', 'Bộ binh', 'Trung đoàn 5');
