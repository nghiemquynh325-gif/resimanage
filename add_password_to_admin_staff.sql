-- =====================================================
-- Add Password Column to Admin Staff Table
-- =====================================================
-- This adds password field to enable admin staff login
-- =====================================================

-- Add password column
ALTER TABLE public.admin_staff 
ADD COLUMN IF NOT EXISTS password TEXT;

-- Verify column was added
SELECT 
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'admin_staff' 
  AND column_name = 'password';

-- Expected result: password | text | YES
