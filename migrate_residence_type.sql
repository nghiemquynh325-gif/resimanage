-- MIGRATION: Separate residence_type from status field
-- This fixes the issue where residence types are stored in status field

-- Step 1: Add residence_type column if not exists
ALTER TABLE residents 
ADD COLUMN IF NOT EXISTS residence_type TEXT;

-- Step 2: Migrate data - Move residence type values from status to residence_type
-- and set proper approval status

UPDATE residents
SET 
  residence_type = CASE 
    WHEN status IN ('Thường trú', 'Tạm trú', 'Tạm vắng', 'Tạm trú có nhà') THEN status
    ELSE residence_type
  END,
  status = CASE 
    WHEN status IN ('Thường trú', 'Tạm trú', 'Tạm vắng', 'Tạm trú có nhà') THEN 'active'
    WHEN status = 'pending_approval' THEN 'pending_approval'
    WHEN status = 'inactive' THEN 'inactive'
    WHEN status = 'rejected' THEN 'rejected'
    ELSE 'active'
  END;

-- Step 3: Set default residence_type for records without one
UPDATE residents
SET residence_type = 'Thường trú'
WHERE residence_type IS NULL OR residence_type = '';

-- Step 4: Verify migration
SELECT 
  id,
  full_name,
  status,
  residence_type,
  created_at
FROM residents
ORDER BY created_at DESC
LIMIT 20;

-- Expected result:
-- status should be: 'active', 'inactive', 'pending_approval', or 'rejected'
-- residence_type should be: 'Thường trú', 'Tạm trú', 'Tạm vắng', or 'Tạm trú có nhà'

-- Step 5: Check distribution
SELECT 
  status,
  COUNT(*) as count
FROM residents
GROUP BY status;

SELECT 
  residence_type,
  COUNT(*) as count
FROM residents
GROUP BY residence_type;
