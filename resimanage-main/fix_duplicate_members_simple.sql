-- =====================================================
-- Fix Duplicate Members - Simple Version
-- =====================================================
-- This script removes ALL duplicate memberships
-- You will need to re-add members to correct household
-- =====================================================

-- Step 1: Find duplicates
SELECT 
  r.id,
  r.full_name,
  COUNT(DISTINCT hm.household_id) as household_count,
  array_agg(DISTINCT h.name ORDER BY h.name) as household_names,
  array_agg(DISTINCT hm.id::text ORDER BY h.name) as membership_ids
FROM public.residents r
JOIN public.household_members hm ON r.id = hm.resident_id
JOIN public.households h ON hm.household_id = h.id
GROUP BY r.id, r.full_name
HAVING COUNT(DISTINCT hm.household_id) > 1;

-- Step 2: Delete ALL memberships for residents with duplicates
-- (You'll need to re-add them to the correct household)
DELETE FROM public.household_members
WHERE resident_id IN (
  SELECT resident_id
  FROM public.household_members
  GROUP BY resident_id
  HAVING COUNT(DISTINCT household_id) > 1
);

-- Step 3: Verify - should be empty now
SELECT 
  r.id,
  r.full_name,
  COUNT(DISTINCT hm.household_id) as household_count
FROM public.residents r
JOIN public.household_members hm ON r.id = hm.resident_id
GROUP BY r.id, r.full_name
HAVING COUNT(DISTINCT hm.household_id) > 1;

-- Step 4: Show current state
SELECT 
  h.name as household_name,
  head.full_name as head_name,
  COUNT(hm.id) as member_count,
  array_agg(r.full_name ORDER BY r.full_name) FILTER (WHERE r.id IS NOT NULL) as members
FROM public.households h
LEFT JOIN public.residents head ON h.head_of_household_id = head.id
LEFT JOIN public.household_members hm ON h.id = hm.household_id
LEFT JOIN public.residents r ON hm.resident_id = r.id
GROUP BY h.id, h.name, head.full_name
ORDER BY h.name;

-- NOTE: After running this, you need to:
-- 1. Go to the app
-- 2. Edit each household
-- 3. Re-add the members that were removed
