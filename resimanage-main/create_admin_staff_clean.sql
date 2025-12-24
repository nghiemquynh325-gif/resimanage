-- =====================================================
-- Create Admin Staff Table (Clean Version)
-- =====================================================
-- Run AFTER reset_admin_staff_table.sql
-- =====================================================

-- Create admin_staff table
CREATE TABLE public.admin_staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone_number TEXT,
  identity_card TEXT,
  position TEXT,
  department TEXT,
  status TEXT DEFAULT 'pending_approval' CHECK (status IN ('pending_approval', 'approved', 'rejected')),
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_admin_staff_email ON public.admin_staff(email);
CREATE INDEX idx_admin_staff_status ON public.admin_staff(status);
CREATE INDEX idx_admin_staff_created_at ON public.admin_staff(created_at DESC);

-- Enable RLS
ALTER TABLE public.admin_staff ENABLE ROW LEVEL SECURITY;

-- Simple RLS Policies (NO recursion)

-- 1. Allow anyone to INSERT (for registration)
CREATE POLICY "admin_staff_insert_policy" 
ON public.admin_staff
FOR INSERT
WITH CHECK (true);

-- 2. Allow anyone to SELECT (read)
CREATE POLICY "admin_staff_select_policy" 
ON public.admin_staff
FOR SELECT
USING (true);

-- 3. Allow anyone authenticated to UPDATE
CREATE POLICY "admin_staff_update_policy" 
ON public.admin_staff
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_admin_staff_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER admin_staff_updated_at
  BEFORE UPDATE ON public.admin_staff
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_staff_updated_at();

-- Verify table creation
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'admin_staff'
ORDER BY ordinal_position;

-- Expected result: Table created with all columns
