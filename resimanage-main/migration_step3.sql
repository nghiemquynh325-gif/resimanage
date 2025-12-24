-- Step 3: Set default residence_type for NULL values
UPDATE residents
SET residence_type = 'Thường trú'
WHERE residence_type IS NULL OR residence_type = '';
