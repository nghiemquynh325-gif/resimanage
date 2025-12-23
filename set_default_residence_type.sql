-- Quick fix: Set default residence type for all residents without one
-- This assumes most residents are "Thường trú" (permanent residence)

UPDATE residents
SET residence_type = 'Thường trú'
WHERE residence_type IS NULL OR residence_type = '';

-- Verify the update
SELECT 
  id,
  full_name,
  status,
  residence_type
FROM residents
LIMIT 10;
