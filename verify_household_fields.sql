-- Kiểm tra xem các cột poor household và policy household có tồn tại không
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'households' 
AND column_name IN (
  'is_poor_household',
  'poor_household_notes',
  'is_policy_household',
  'policy_household_notes'
)
ORDER BY column_name;

-- Kiểm tra data của một số hộ
SELECT 
  id,
  name,
  is_poor_household,
  poor_household_notes,
  is_policy_household,
  policy_household_notes,
  updated_at
FROM households 
ORDER BY updated_at DESC
LIMIT 10;
