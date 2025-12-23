-- Step 2: Migrate residence type data from status to residence_type
UPDATE residents
SET 
  residence_type = status,
  status = 'active'
WHERE status IN ('Thường trú', 'Tạm trú', 'Tạm vắng', 'Tạm trú có nhà');
