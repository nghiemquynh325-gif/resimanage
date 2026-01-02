-- Setup Supabase Storage for Procedure Files (FIXED VERSION)

-- Note: Storage buckets are typically created via Supabase Dashboard
-- This script shows the policies needed after bucket creation

-- Create storage bucket via Dashboard:
-- Bucket name: procedure-files
-- Public: true

-- Storage policies for procedure-files bucket
-- Policy 1: Anyone can download files
CREATE POLICY "Anyone can download procedure files"
ON storage.objects FOR SELECT
USING (bucket_id = 'procedure-files');

-- Policy 2: Authenticated users can upload files (simplified - no admin check)
CREATE POLICY "Authenticated users can upload procedure files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'procedure-files' AND
  auth.role() = 'authenticated'
);

-- Policy 3: Authenticated users can delete files
CREATE POLICY "Authenticated users can delete procedure files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'procedure-files' AND
  auth.role() = 'authenticated'
);

-- Verify bucket exists
SELECT * FROM storage.buckets WHERE id = 'procedure-files';
