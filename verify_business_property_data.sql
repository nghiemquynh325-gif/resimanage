-- Kiểm tra xem các cột đã được tạo chưa
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'households' 
AND column_name IN (
  'land_plot_number',
  'land_map_sheet_number', 
  'certificate_issue_number',
  'certificate_registry_number',
  'business_area',
  'business_construction_year',
  'business_floors',
  'business_rooms',
  'business_sector'
)
ORDER BY column_name;

-- Kiểm tra dữ liệu của hộ vừa tạo/sửa
SELECT 
  id,
  name,
  is_business,
  land_plot_number,
  land_map_sheet_number,
  certificate_issue_number,
  certificate_registry_number,
  business_area,
  business_construction_year,
  business_floors,
  business_rooms,
  business_sector,
  updated_at
FROM households 
WHERE is_business = true
ORDER BY updated_at DESC
LIMIT 5;
