-- Test query to see actual data in a specific household
-- Replace 'HOUSEHOLD_ID_HERE' with actual ID from your household list
SELECT 
  id,
  name,
  is_business,
  business_name,
  business_area,
  business_construction_year,
  business_floors,
  business_rooms,
  business_sector
FROM households
ORDER BY created_at DESC
LIMIT 10;
