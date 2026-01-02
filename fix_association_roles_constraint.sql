-- Migration script to update role constraint for association_members table
-- This version is for TEXT column with CHECK constraint

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

-- Verify the constraint was added
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'association_members'::regclass
AND conname = 'association_members_role_check';
