-- =====================================================
-- Fix RLS Policy for Posts Table
-- =====================================================
-- Script này sửa lỗi RLS để cho phép admin đăng bài
-- =====================================================

-- Xóa policy cũ
DROP POLICY IF EXISTS "Authenticated users can create posts" ON public.posts;
DROP POLICY IF EXISTS "Anyone can create posts" ON public.posts;

-- Tạo policy mới: Cho phép tất cả users đăng bài
CREATE POLICY "Anyone can create posts"
  ON public.posts
  FOR INSERT
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
WHERE tablename = 'posts' AND cmd = 'INSERT';
