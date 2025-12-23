-- Fix RLS policies for household_members table
-- This script drops existing policies and recreates them with proper permissions

-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users to read household members" ON household_members;
DROP POLICY IF EXISTS "Allow authenticated users to insert household members" ON household_members;
DROP POLICY IF EXISTS "Allow authenticated users to update household members" ON household_members;
DROP POLICY IF EXISTS "Allow authenticated users to delete household members" ON household_members;

-- Recreate policies with proper permissions
-- Policy: Allow all authenticated users to read household members
CREATE POLICY "Allow authenticated users to read household members"
ON household_members
FOR SELECT
TO authenticated
USING (true);

-- Policy: Allow all authenticated users to insert household members
CREATE POLICY "Allow authenticated users to insert household members"
ON household_members
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy: Allow all authenticated users to update household members
CREATE POLICY "Allow authenticated users to update household members"
ON household_members
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy: Allow all authenticated users to delete household members
CREATE POLICY "Allow authenticated users to delete household members"
ON household_members
FOR DELETE
TO authenticated
USING (true);

-- Verify policies are created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'household_members';
