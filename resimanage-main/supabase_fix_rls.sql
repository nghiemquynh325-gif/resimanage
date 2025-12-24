-- =====================================================
-- FIX: RLS Policy cho household_members
-- =====================================================
-- Chạy script này để fix lỗi RLS khi insert household members
-- =====================================================

-- Xóa policy cũ
DROP POLICY IF EXISTS "Admins can manage household members" ON public.household_members;

-- Tạo lại policy với WITH CHECK clause
CREATE POLICY "Admins can manage household members"
  ON public.household_members
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- =====================================================
-- HOÀN TẤT!
-- =====================================================
-- Sau khi chạy script này, bạn có thể tạo hộ gia đình mới
-- và thêm thành viên mà không bị lỗi RLS nữa.
-- =====================================================
