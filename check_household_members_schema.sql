-- =====================================================
-- Check household_members table structure
-- =====================================================

-- Show table columns
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'household_members'
ORDER BY ordinal_position;

-- Show constraints
SELECT
  con.conname as constraint_name,
  con.contype as constraint_type,
  CASE con.contype
    WHEN 'p' THEN 'PRIMARY KEY'
    WHEN 'u' THEN 'UNIQUE'
    WHEN 'f' THEN 'FOREIGN KEY'
    WHEN 'c' THEN 'CHECK'
  END as type_description
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE nsp.nspname = 'public'
  AND rel.relname = 'household_members';

-- Show sample data
SELECT * FROM public.household_members LIMIT 5;
