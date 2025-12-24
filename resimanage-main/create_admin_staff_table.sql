-- =====================================================
-- Create Admin Staff Table
-- =====================================================
-- This table stores admin/staff registration data
-- separate from residents table
-- =====================================================

-- Create admin_staff table
CREATE TABLE IF NOT EXISTS public.admin_staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone_number TEXT,
  identity_card TEXT,
  position TEXT, -- Chức vụ (e.g., Trưởng phòng, Phó phòng, Chuyên viên)
  department TEXT, -- Phòng ban (e.g., Hành chính, Tổ chức, Văn phòng)
  status TEXT DEFAULT 'pending_approval' CHECK (status IN ('pending_approval', 'approved', 'rejected')),
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_admin_staff_email ON public.admin_staff(email);
CREATE INDEX IF NOT EXISTS idx_admin_staff_status ON public.admin_staff(status);
CREATE INDEX IF NOT EXISTS idx_admin_staff_created_at ON public.admin_staff(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.admin_staff ENABLE ROW LEVEL SECURITY;

-- RLS Policies (with DROP IF EXISTS to avoid conflicts)

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public insert for registration" ON public.admin_staff;
DROP POLICY IF EXISTS "Allow public select" ON public.admin_staff;
DROP POLICY IF EXISTS "Allow authenticated update" ON public.admin_staff;

-- Allow anyone to insert (for registration)
CREATE POLICY "Allow public insert for registration" ON public.admin_staff
  FOR INSERT
  WITH CHECK (true);

-- Allow anyone to read (for now - can be restricted later)
-- This avoids infinite recursion issues
CREATE POLICY "Allow public select" ON public.admin_staff
  FOR SELECT
  USING (true);

-- Allow authenticated users to update
-- In production, you should restrict this to only admins
CREATE POLICY "Allow authenticated update" ON public.admin_staff
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Create updated_at trigger
DROP FUNCTION IF EXISTS update_admin_staff_updated_at() CASCADE;

CREATE OR REPLACE FUNCTION update_admin_staff_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS admin_staff_updated_at ON public.admin_staff;

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
