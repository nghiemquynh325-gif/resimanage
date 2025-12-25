-- =====================================================
-- Create RPC Function for Voting Statistics
-- =====================================================
-- This function aggregates voting stats directly in PostgreSQL
-- to avoid the 1000-row limit when fetching data
-- =====================================================

CREATE OR REPLACE FUNCTION get_voting_stats_by_unit()
RETURNS TABLE (
  unit TEXT,
  total_count BIGINT,
  voted_count BIGINT
) 
LANGUAGE sql
AS $$
  SELECT 
    COALESCE(unit, 'Không có tổ') as unit,
    COUNT(*) as total_count,
    COUNT(*) FILTER (WHERE has_voted = true) as voted_count
  FROM residents
  GROUP BY unit
  ORDER BY unit;
$$;

-- Test the function
-- SELECT * FROM get_voting_stats_by_unit();

-- =====================================================
-- INSTRUCTIONS:
-- 1. Run this SQL in Supabase SQL Editor
-- 2. This will create a PostgreSQL function that:
--    - Groups residents by 'unit' (Tổ)
--    - Counts total residents per group
--    - Counts voted residents per group
-- 3. Works with ANY number of residents (no 1000 limit)
-- =====================================================
