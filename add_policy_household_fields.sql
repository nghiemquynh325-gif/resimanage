-- =====================================================
-- Add Policy Household Fields to Households Table
-- =====================================================
-- This migration adds support for policy households
-- (hộ chính sách - households with special government policies)
-- =====================================================

-- Add policy household columns to households table
ALTER TABLE households
ADD COLUMN IF NOT EXISTS is_policy_household BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS policy_household_notes TEXT;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_households_is_policy ON households(is_policy_household) WHERE is_policy_household = TRUE;

-- Add comments for documentation
COMMENT ON COLUMN households.is_policy_household IS 'Flag indicating if this household is classified as policy household';
COMMENT ON COLUMN households.policy_household_notes IS 'Free-text notes about policy household classification';

-- =====================================================
-- Migration Complete!
-- =====================================================
