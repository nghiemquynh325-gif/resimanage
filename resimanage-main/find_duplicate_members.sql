-- =====================================================
-- Find Duplicate Members Across Households
-- =====================================================
-- This will show which residents appear in multiple households
-- =====================================================

-- Find residents that appear in multiple households
SELECT 
  r.id,
  r.full_name,
  COUNT(DISTINCT hm.household_id) as household_count,
  array_agg(DISTINCT h.name) as household_names
FROM public.residents r
JOIN public.household_members hm ON r.id = hm.resident_id
JOIN public.households h ON hm.household_id = h.id
GROUP BY r.id, r.full_name
HAVING COUNT(DISTINCT hm.household_id) > 1;

-- Show all household memberships with details
SELECT 
  h.name as household_name,
  h.head_of_household_id,
  head.full_name as head_name,
  r.id as member_id,
  r.full_name as member_name,
  hm.relationship,
  CASE 
    WHEN r.id = h.head_of_household_id THEN 'HEAD (should not be in members!)'
    ELSE 'Member'
  END as role
FROM public.household_members hm
JOIN public.households h ON hm.household_id = h.id
JOIN public.residents r ON hm.resident_id = r.id
LEFT JOIN public.residents head ON h.head_of_household_id = head.id
ORDER BY h.name, role DESC, r.full_name;
