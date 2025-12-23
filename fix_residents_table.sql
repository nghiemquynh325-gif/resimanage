-- =====================================================
-- FIX: Update residents table to allow NULL for dob and phone_number
-- =====================================================
-- This script modifies the existing residents table to allow:
-- 1. dob (date of birth) to be NULL
-- 2. phone_number to be NULL (will be auto-generated)
-- =====================================================

-- First, drop the NOT NULL constraints
ALTER TABLE public.residents 
  ALTER COLUMN dob DROP NOT NULL;

ALTER TABLE public.residents 
  ALTER COLUMN phone_number DROP NOT NULL;

-- Verify the changes
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'residents'
  AND column_name IN ('dob', 'phone_number', 'full_name', 'gender', 'address');
