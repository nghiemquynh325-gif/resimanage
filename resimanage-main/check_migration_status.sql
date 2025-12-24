-- Check if residence_type column exists and has data
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'residents' 
  AND column_name = 'residence_type';

-- Check current data
SELECT 
  id,
  full_name,
  status,
  residence_type,
  created_at
FROM residents
ORDER BY created_at DESC
LIMIT 10;

-- Check distribution of status values
SELECT 
  status,
  COUNT(*) as count
FROM residents
GROUP BY status
ORDER BY count DESC;

-- Check distribution of residence_type values
SELECT 
  residence_type,
  COUNT(*) as count
FROM residents
GROUP BY residence_type
ORDER BY count DESC;
