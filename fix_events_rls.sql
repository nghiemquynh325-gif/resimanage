-- =====================================================
-- Fix RLS Policy for Events Table
-- =====================================================
-- Script này sửa lỗi RLS để cho phép admin tạo sự kiện
-- =====================================================

-- Xóa policy cũ
DROP POLICY IF EXISTS "Admins can manage events" ON public.events;

-- Tạo policy mới: Cho phép tất cả users tạo/sửa/xóa sự kiện
CREATE POLICY "Anyone can manage events"
  ON public.events
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Verify: Kiểm tra policy đã được tạo
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'events';
