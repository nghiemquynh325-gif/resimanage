-- =====================================================
-- Fix Duplicate Members in Households
-- =====================================================
-- This script removes duplicate household memberships
-- Keeps the MOST RECENT membership for each resident
-- =====================================================

-- Step 1: Find and display duplicates before fixing
SELECT 
  r.id,
  r.full_name,
  COUNT(DISTINCT hm.household_id) as household_count,
  array_agg(DISTINCT h.name ORDER BY h.name) as household_names
FROM public.residents r
JOIN public.household_members hm ON r.id = hm.resident_id
JOIN public.households h ON hm.household_id = h.id
GROUP BY r.id, r.full_name
HAVING COUNT(DISTINCT hm.household_id) > 1;

-- Step 2: Delete duplicate memberships, keeping only the most recent one
-- Use ROW_NUMBER to identify duplicates and keep the first one
DELETE FROM public.household_members
WHERE id IN (
  SELECT id
  FROM (
    SELECT 
      id,
      resident_id,
      ROW_NUMBER() OVER (PARTITION BY resident_id ORDER BY created_at DESC) as rn
    FROM public.household_members
  ) ranked
  WHERE rn > 1
);

-- Step 3: Verify - this should return empty (no duplicates)
SELECT 
  r.id,
  r.full_name,
  COUNT(DISTINCT hm.household_id) as household_count,
  array_agg(DISTINCT h.name ORDER BY h.name) as household_names
FROM public.residents r
JOIN public.household_members hm ON r.id = hm.resident_id
JOIN public.households h ON hm.household_id = h.id
GROUP BY r.id, r.full_name
HAVING COUNT(DISTINCT hm.household_id) > 1;

-- Step 4: Show final household memberships
SELECT 
  h.name as household_name,
  head.full_name as head_name,
  COUNT(hm.id) as member_count,
  array_agg(r.full_name || ' (' || COALESCE(hm.relationship, 'No relationship') || ')' 
    ORDER BY r.full_name) as members
FROM public.households h
LEFT JOIN public.residents head ON h.head_of_household_id = head.id
LEFT JOIN public.household_members hm ON h.id = hm.household_id
LEFT JOIN public.residents r ON hm.resident_id = r.id
GROUP BY h.id, h.name, head.full_name
ORDER BY h.name;

-- Expected result:
-- - Step 1: Shows duplicates (if any)
-- - Step 2: Deletes older duplicate records (keeps most recent)
-- - Step 3: Should be empty (no more duplicates)
-- - Step 4: Shows clean household data
