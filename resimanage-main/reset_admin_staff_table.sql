-- =====================================================
-- RESET Admin Staff Table - Run this FIRST
-- =====================================================
-- This script completely removes the admin_staff table
-- and all related objects to start fresh
-- =====================================================

-- Drop all policies first
DROP POLICY IF EXISTS "Allow public insert for registration" ON public.admin_staff;
DROP POLICY IF EXISTS "Allow public select" ON public.admin_staff;
DROP POLICY IF EXISTS "Allow authenticated update" ON public.admin_staff;
DROP POLICY IF EXISTS "Allow users to read own data" ON public.admin_staff;
DROP POLICY IF EXISTS "Allow admins to read all" ON public.admin_staff;
DROP POLICY IF EXISTS "Allow admins to update" ON public.admin_staff;

-- Drop trigger and function
DROP TRIGGER IF EXISTS admin_staff_updated_at ON public.admin_staff;
DROP FUNCTION IF EXISTS update_admin_staff_updated_at() CASCADE;

-- Drop indexes
DROP INDEX IF EXISTS idx_admin_staff_email;
DROP INDEX IF EXISTS idx_admin_staff_status;
DROP INDEX IF EXISTS idx_admin_staff_created_at;

-- Drop the table completely
DROP TABLE IF EXISTS public.admin_staff CASCADE;

-- Verify deletion
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'admin_staff';

-- Expected result: No rows (table deleted)
