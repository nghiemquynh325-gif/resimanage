-- Create household_members junction table
-- This table manages the many-to-many relationship between households and residents

CREATE TABLE IF NOT EXISTS household_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    resident_id UUID NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
    relationship VARCHAR(100), -- Relationship to head of household (e.g., "Vợ", "Con", "Cha")
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure a resident can only be in one household at a time
    UNIQUE(resident_id),
    
    -- Ensure no duplicate entries for same household-resident pair
    UNIQUE(household_id, resident_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_household_members_household_id ON household_members(household_id);
CREATE INDEX IF NOT EXISTS idx_household_members_resident_id ON household_members(resident_id);

-- Add RLS (Row Level Security) policies
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to read household members
CREATE POLICY "Allow authenticated users to read household members"
ON household_members
FOR SELECT
TO authenticated
USING (true);

-- Policy: Allow authenticated users to insert household members
CREATE POLICY "Allow authenticated users to insert household members"
ON household_members
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy: Allow authenticated users to update household members
CREATE POLICY "Allow authenticated users to update household members"
ON household_members
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy: Allow authenticated users to delete household members
CREATE POLICY "Allow authenticated users to delete household members"
ON household_members
FOR DELETE
TO authenticated
USING (true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_household_members_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function before update
CREATE TRIGGER household_members_updated_at_trigger
BEFORE UPDATE ON household_members
FOR EACH ROW
EXECUTE FUNCTION update_household_members_updated_at();

-- Add comment to table
COMMENT ON TABLE household_members IS 'Junction table managing the relationship between households and their resident members';
COMMENT ON COLUMN household_members.relationship IS 'Relationship of the member to the head of household (e.g., Vợ, Con, Cha, Mẹ)';
