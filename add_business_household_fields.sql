-- =====================================================
-- Add Business Household Fields to Households Table
-- =====================================================
-- This migration adds support for business households
-- with license information and owner/manager tracking
-- =====================================================

-- Add business-related columns to households table
ALTER TABLE households
ADD COLUMN IF NOT EXISTS is_business BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS business_name TEXT,
ADD COLUMN IF NOT EXISTS business_license_number TEXT,
ADD COLUMN IF NOT EXISTS business_license_date DATE,
ADD COLUMN IF NOT EXISTS business_owner_id UUID REFERENCES residents(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS business_manager_id UUID REFERENCES residents(id) ON DELETE SET NULL;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_households_is_business ON households(is_business) WHERE is_business = TRUE;
CREATE INDEX IF NOT EXISTS idx_households_business_owner ON households(business_owner_id) WHERE business_owner_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_households_business_manager ON households(business_manager_id) WHERE business_manager_id IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN households.is_business IS 'Flag indicating if this household is a business establishment';
COMMENT ON COLUMN households.business_name IS 'Business establishment name as per business license';
COMMENT ON COLUMN households.business_license_number IS 'Business license number';
COMMENT ON COLUMN households.business_license_date IS 'Date when business license was issued';
COMMENT ON COLUMN households.business_owner_id IS 'Reference to resident who owns the business';
COMMENT ON COLUMN households.business_manager_id IS 'Reference to resident who manages the business';

-- =====================================================
-- Migration Complete!
-- =====================================================
-- Next steps:
-- 1. Verify the migration ran successfully
-- 2. Update application code to use new fields
-- 3. Test creating and editing business households
-- =====================================================
