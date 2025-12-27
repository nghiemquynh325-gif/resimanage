-- =====================================================
-- Add Poor Household Fields to Households Table
-- =====================================================
-- This migration adds support for poor/near-poor households
-- with a free-text description field
-- =====================================================

-- Add poor household columns to households table
ALTER TABLE households
ADD COLUMN IF NOT EXISTS is_poor_household BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS poor_household_notes TEXT;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_households_is_poor ON households(is_poor_household) WHERE is_poor_household = TRUE;

-- Add comments for documentation
COMMENT ON COLUMN households.is_poor_household IS 'Flag indicating if this household is classified as poor/near-poor';
COMMENT ON COLUMN households.poor_household_notes IS 'Free-text notes about poor household classification';

-- =====================================================
-- Migration Complete!
-- =====================================================
