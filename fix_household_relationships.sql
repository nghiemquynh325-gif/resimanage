-- =====================================================
-- Fix Household Relationships Data
-- =====================================================
-- This script removes head of household from relationships
-- Run this in Supabase SQL Editor to fix existing data
-- =====================================================

-- Delete household_members records where resident is the head of household
-- (Head should not have a relationship entry)
DELETE FROM public.household_members hm
USING public.households h
WHERE hm.household_id = h.id
  AND hm.resident_id = h.head_of_household_id;

-- Verify the changes
SELECT 
  h.id,
  h.name,
  h.head_of_household_id,
  head.full_name as head_name,
  COUNT(hm.id) as member_count,
  array_agg(
    CASE 
      WHEN hm.resident_id IS NOT NULL 
      THEN r.full_name || ' (' || COALESCE(hm.relationship, 'No relationship') || ')'
      ELSE NULL
    END
  ) FILTER (WHERE hm.resident_id IS NOT NULL) as members_with_relationships
FROM public.households h
LEFT JOIN public.residents head ON h.head_of_household_id = head.id
LEFT JOIN public.household_members hm ON h.id = hm.household_id
LEFT JOIN public.residents r ON hm.resident_id = r.id
GROUP BY h.id, h.name, h.head_of_household_id, head.full_name
ORDER BY h.created_at DESC;

-- Expected result: 
-- - Head of household should NOT appear in household_members table
-- - member_count should match the actual number of members (excluding head)
-- - Only non-head members should have relationships listed
