-- Simple test data for military info
-- Run this step by step in Supabase SQL Editor

-- Step 1: Create table (if not exists)
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

-- Step 2: Insert discharged_military association
INSERT INTO associations (name, type, description) VALUES
  ('Quân nhân xuất ngũ', 'discharged_military', 'Hội Quân nhân xuất ngũ khu phố')
ON CONFLICT (type) DO NOTHING;

-- Step 3: Check if you have any members in discharged_military
-- SELECT am.id, am.resident_id, r.full_name 
-- FROM association_members am
-- JOIN residents r ON r.id = am.resident_id
-- JOIN associations a ON a.id = am.association_id
-- WHERE a.type = 'discharged_military';

-- Step 4: Insert sample military info (replace 'MEMBER_ID_HERE' with actual member ID from step 3)
-- INSERT INTO military_info (
--   association_member_id,
--   enlistment_date,
--   discharge_date,
--   rank,
--   position,
--   military_specialty,
--   last_unit
-- ) VALUES (
--   'MEMBER_ID_HERE',
--   '2010-01-15',
--   '2015-12-20',
--   'Trung sĩ',
--   'Tiểu đội trưởng',
--   'Bộ binh',
--   'Trung đoàn 5'
-- );
