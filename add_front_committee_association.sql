-- Migration: Add "Ban Công Tác Mặt Trận" (Front Committee) Association
-- This adds a new association type for managing Front Committee members

-- Step 1: Drop the existing CHECK constraint on associations.type
ALTER TABLE associations DROP CONSTRAINT IF EXISTS associations_type_check;

-- Step 2: Add the new CHECK constraint with 'front_committee' included
ALTER TABLE associations ADD CONSTRAINT associations_type_check 
  CHECK (type IN ('veterans', 'women', 'youth', 'red_cross', 'discharged_military', 'party_member_213', 'militia', 'security_force', 'front_committee'));

-- Step 3: Insert the new association record
INSERT INTO associations (name, type, description) 
VALUES ('Ban Công Tác Mặt Trận', 'front_committee', 'Ban Công Tác Mặt Trận khu phố')
ON CONFLICT (type) DO NOTHING;

-- Verify the insertion
SELECT * FROM associations WHERE type = 'front_committee';
