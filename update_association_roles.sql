-- Migration script to add new role values to association_members table

-- First, check if role column uses an enum type
-- If it does, we need to add new values to the enum

-- Add new role values to the enum (if role is an enum type)
-- Note: This assumes the enum is named 'association_role' or similar
-- Adjust the enum name based on your actual schema

DO $$ 
BEGIN
    -- Try to add new enum values
    -- PostgreSQL doesn't allow adding enum values in a transaction, so we use ALTER TYPE
    
    -- Add militia roles
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'squad_leader') THEN
        ALTER TYPE association_role ADD VALUE 'squad_leader';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'team_leader') THEN
        ALTER TYPE association_role ADD VALUE 'team_leader';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'fighter') THEN
        ALTER TYPE association_role ADD VALUE 'fighter';
    END IF;
    
    -- Add security force roles
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'group_leader') THEN
        ALTER TYPE association_role ADD VALUE 'group_leader';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'deputy_leader') THEN
        ALTER TYPE association_role ADD VALUE 'deputy_leader';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'group_member') THEN
        ALTER TYPE association_role ADD VALUE 'group_member';
    END IF;
END $$;

-- Verify the enum values
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (
    SELECT oid 
    FROM pg_type 
    WHERE typname = 'association_role'
)
ORDER BY enumlabel;

-- Alternative: If role is a text column with CHECK constraint, we need to drop and recreate the constraint
-- Uncomment and modify this section if needed:

/*
-- Drop existing check constraint (if exists)
ALTER TABLE association_members 
DROP CONSTRAINT IF EXISTS association_members_role_check;

-- Add new check constraint with all role values
ALTER TABLE association_members
ADD CONSTRAINT association_members_role_check 
CHECK (role IN (
    'president', 
    'vice_president', 
    'member',
    'squad_leader',
    'team_leader',
    'fighter',
    'group_leader',
    'deputy_leader',
    'group_member'
));
*/
