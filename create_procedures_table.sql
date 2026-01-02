-- Create Administrative Procedures Table (FIXED VERSION)
CREATE TABLE IF NOT EXISTS admin_procedures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  file_urls JSONB DEFAULT '[]'::jsonb,
  youtube_url TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE admin_procedures ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin_procedures
-- Everyone can read procedures
CREATE POLICY "Anyone can view procedures" ON admin_procedures
  FOR SELECT USING (true);

-- Only authenticated users can insert procedures (simplified - no admin check)
CREATE POLICY "Authenticated users can create procedures" ON admin_procedures
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Only authenticated users can update procedures
CREATE POLICY "Authenticated users can update procedures" ON admin_procedures
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Only authenticated users can delete procedures
CREATE POLICY "Authenticated users can delete procedures" ON admin_procedures
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create indexes
CREATE INDEX idx_procedures_created_at ON admin_procedures(created_at DESC);
CREATE INDEX idx_procedures_category ON admin_procedures(category);
CREATE INDEX idx_procedures_created_by ON admin_procedures(created_by);
