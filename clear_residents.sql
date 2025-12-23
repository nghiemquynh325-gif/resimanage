-- =====================================================
-- Clear all residents data for re-import
-- =====================================================
-- This script deletes all existing residents data
-- Run this in Supabase SQL Editor before re-importing
-- =====================================================

-- Delete all residents
DELETE FROM public.residents;

-- Reset any sequences if needed
-- (UUID doesn't use sequences, so this is just for reference)

-- Verify deletion
SELECT COUNT(*) as remaining_records FROM public.residents;

-- Expected result: 0 records
