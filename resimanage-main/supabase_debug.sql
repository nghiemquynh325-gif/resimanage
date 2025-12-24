-- =====================================================
-- DEBUG SCRIPT: Check Supabase Configuration
-- =====================================================
-- Run this script to diagnose registration issues
-- =====================================================

-- 1. Check if profiles table exists and view its structure
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 2. Check if trigger exists
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public' 
  OR event_object_table = 'users';

-- 3. Check if trigger function exists
SELECT 
  routine_name,
  routine_type,
  routine_schema
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('handle_new_user', 'handle_updated_at');

-- 4. Check existing RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'profiles';

-- 5. Check if RLS is enabled
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename = 'profiles';

-- 6. View existing profiles (if any)
SELECT 
  id,
  email,
  username,
  full_name,
  role,
  status,
  created_at
FROM public.profiles
ORDER BY created_at DESC
LIMIT 10;

-- =====================================================
-- RESULTS INTERPRETATION:
-- =====================================================
-- If profiles table doesn't exist: Run the main migration script
-- If trigger doesn't exist: The trigger creation failed
-- If RLS is disabled: Policies won't work
-- If you see errors: Share them for further debugging
-- =====================================================
