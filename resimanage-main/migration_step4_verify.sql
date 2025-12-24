-- Step 4: Verify the migration
SELECT 
  id,
  full_name,
  status,
  residence_type
FROM residents
ORDER BY created_at DESC
LIMIT 20;
