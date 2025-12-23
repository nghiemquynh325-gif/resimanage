-- =====================================================
-- Debug Household Data
-- =====================================================
-- Run this to check current household data and find issues
-- =====================================================

-- 1. Check all households with their members
SELECT 
  h.id as household_id,
  h.name as household_name,
  h.head_of_household_id,
  head.full_name as head_name,
  COUNT(DISTINCT hm.resident_id) as members_in_table,
  array_agg(DISTINCT hm.resident_id) FILTER (WHERE hm.resident_id IS NOT NULL) as member_ids,
  array_agg(DISTINCT r.full_name || ' (' || COALESCE(hm.relationship, 'NO REL') || ')') 
    FILTER (WHERE hm.resident_id IS NOT NULL) as members_with_relationships
FROM public.households h
LEFT JOIN public.residents head ON h.head_of_household_id = head.id
LEFT JOIN public.household_members hm ON h.id = hm.household_id
LEFT JOIN public.residents r ON hm.resident_id = r.id
GROUP BY h.id, h.name, h.head_of_household_id, head.full_name
ORDER BY h.created_at DESC;

-- 2. Check if any head is in household_members (THIS SHOULD BE EMPTY!)
SELECT 
  h.name as household_name,
  head.full_name as head_name,
  hm.relationship as head_relationship
FROM public.household_members hm
JOIN public.households h ON hm.household_id = h.id
JOIN public.residents head ON hm.resident_id = h.head_of_household_id
WHERE hm.resident_id = h.head_of_household_id;

-- 3. Count residents by household status
SELECT 
  'Total Residents' as category,
  COUNT(*) as count
FROM public.residents
UNION ALL
SELECT 
  'Residents in household_members' as category,
  COUNT(DISTINCT resident_id) as count
FROM public.household_members
UNION ALL
SELECT 
  'Heads of household' as category,
  COUNT(DISTINCT head_of_household_id) as count
FROM public.households
WHERE head_of_household_id IS NOT NULL
UNION ALL
SELECT 
  'Unique residents in households (members + heads)' as category,
  COUNT(DISTINCT resident_id) as count
FROM (
  SELECT resident_id FROM public.household_members
  UNION
  SELECT head_of_household_id as resident_id FROM public.households WHERE head_of_household_id IS NOT NULL
) combined;

-- 4. Find residents with household_id but not in household_members
SELECT 
  r.id,
  r.full_name,
  r.household_id,
  h.name as household_name,
  CASE 
    WHEN hm.resident_id IS NOT NULL THEN 'In household_members'
    WHEN r.id = h.head_of_household_id THEN 'Is head (not in members)'
    ELSE 'ORPHANED - has household_id but not in members or head'
  END as status
FROM public.residents r
LEFT JOIN public.households h ON r.household_id = h.id
LEFT JOIN public.household_members hm ON hm.resident_id = r.id AND hm.household_id = r.household_id
WHERE r.household_id IS NOT NULL
ORDER BY status, r.full_name;
