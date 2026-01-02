-- Check sample household data with business properties
SELECT 
  id, 
  name, 
  is_business, 
  business_area, 
  business_construction_year, 
  business_floors, 
  business_rooms, 
  business_sector
FROM households
WHERE is_business = true
LIMIT 5;
