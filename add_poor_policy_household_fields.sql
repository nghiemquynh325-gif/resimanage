-- =====================================================
-- Add Poor Household and Policy Household Fields
-- =====================================================
-- This migration adds support for tracking poor households
-- and policy households with notes
-- =====================================================

-- Add poor household columns
ALTER TABLE households
ADD COLUMN IF NOT EXISTS is_poor_household BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS poor_household_notes TEXT;

-- Add policy household columns
ALTER TABLE households
ADD COLUMN IF NOT EXISTS is_policy_household BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS policy_household_notes TEXT;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_households_is_poor ON households(is_poor_household) WHERE is_poor_household = TRUE;
CREATE INDEX IF NOT EXISTS idx_households_is_policy ON households(is_policy_household) WHERE is_policy_household = TRUE;

-- Add comments for documentation
COMMENT ON COLUMN households.is_poor_household IS 'Flag indicating if this is a poor or near-poor household';
COMMENT ON COLUMN households.poor_household_notes IS 'Notes about poor household status and support programs';
COMMENT ON COLUMN households.is_policy_household IS 'Flag indicating if this is a policy household (gia đình chính sách)';
COMMENT ON COLUMN households.policy_household_notes IS 'Notes about policy household status and benefits';

-- =====================================================
-- Migration Complete!
-- =====================================================
-- Next steps:
-- 1. Verify the migration ran successfully
-- 2. Test creating households with poor/policy status
-- =====================================================
