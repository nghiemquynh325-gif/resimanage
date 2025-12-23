-- =====================================================
-- Show Detailed Household Breakdown
-- =====================================================
-- This shows EXACTLY who is in each household
-- =====================================================

-- Show all members with their roles
SELECT 
  h.name as household_name,
  r.id as resident_id,
  r.full_name,
  CASE 
    WHEN r.id = h.head_of_household_id THEN '👑 CHỦ HỘ'
    ELSE '👤 Thành viên (' || COALESCE(hm.relationship, 'Chưa có quan hệ') || ')'
  END as role,
  CASE 
    WHEN hm.id IS NOT NULL THEN 'Trong household_members'
    ELSE 'KHÔNG trong household_members'
  END as in_members_table
FROM public.households h
CROSS JOIN public.residents r
LEFT JOIN public.household_members hm ON hm.household_id = h.id AND hm.resident_id = r.id
WHERE r.id = h.head_of_household_id 
   OR hm.id IS NOT NULL
ORDER BY h.name, (r.id = h.head_of_household_id) DESC, r.full_name;

-- Count by household
SELECT 
  h.name as household_name,
  h.head_of_household_id,
  head.full_name as head_name,
  COUNT(DISTINCT hm.resident_id) as members_count,
  1 + COUNT(DISTINCT hm.resident_id) as total_with_head
FROM public.households h
LEFT JOIN public.residents head ON h.head_of_household_id = head.id
LEFT JOIN public.household_members hm ON h.id = hm.household_id
GROUP BY h.id, h.name, h.head_of_household_id, head.full_name
ORDER BY h.name;

-- Total unique residents across all households
SELECT 
  COUNT(DISTINCT resident_id) as unique_residents_in_members,
  (SELECT COUNT(DISTINCT head_of_household_id) FROM public.households WHERE head_of_household_id IS NOT NULL) as unique_heads,
  COUNT(DISTINCT resident_id) + (SELECT COUNT(DISTINCT head_of_household_id) FROM public.households WHERE head_of_household_id IS NOT NULL) as total_unique
FROM public.household_members;
