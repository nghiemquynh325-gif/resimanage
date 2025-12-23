-- Option 1: Clear ALL residence_type to show N/A for everyone
UPDATE residents SET residence_type = NULL;

-- Option 2: Clear residence_type for specific residents by phone number
-- (Easier to identify than UUID)
UPDATE residents
SET residence_type = NULL
WHERE phone_number IN ('09009114', '09009120', '09009092');

-- Option 3: Clear residence_type for residents in a specific unit
UPDATE residents
SET residence_type = NULL
WHERE unit = '3';

-- Option 4: Clear residence_type for recently created residents
UPDATE residents
SET residence_type = NULL
WHERE created_at > '2025-12-20';

-- Verify changes
SELECT 
  id,
  full_name,
  phone_number,
  residence_type,
  status
FROM residents
WHERE residence_type IS NULL
LIMIT 10;
