-- =====================================================
-- Supabase Schema: Events Table
-- =====================================================
-- Bảng này lưu trữ thông tin sự kiện/lịch họp
-- Chạy script này sau khi đã chạy supabase_residents_households.sql
-- =====================================================

-- Xóa bảng cũ nếu tồn tại (chỉ dùng khi development)
DROP TABLE IF EXISTS public.events CASCADE;

CREATE TABLE IF NOT EXISTS public.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  "start" TIMESTAMP WITH TIME ZONE NOT NULL,
  "end" TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  description TEXT,
  type TEXT CHECK (type IN ('Họp', 'Sinh hoạt', 'Khác')),
  background_color TEXT DEFAULT '#3b82f6',
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_events_start ON public.events("start");
CREATE INDEX IF NOT EXISTS idx_events_end ON public.events("end");
CREATE INDEX IF NOT EXISTS idx_events_type ON public.events(type);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can manage events" ON public.events;
DROP POLICY IF EXISTS "Users can view events" ON public.events;

-- RLS Policies
CREATE POLICY "Admins can manage events"
  ON public.events
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

CREATE POLICY "Users can view events"
  ON public.events
  FOR SELECT
  USING (true); -- Mọi người đều có thể xem sự kiện

-- Trigger để tự động cập nhật updated_at
DROP TRIGGER IF EXISTS on_event_updated ON public.events;
CREATE TRIGGER on_event_updated
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- Sample Data (TÙY CHỌN)
-- =====================================================
/*
INSERT INTO public.events (title, start, "end", location, description, type)
VALUES 
  ('Họp tổ dân phố', '2025-01-15 14:00:00+07', '2025-01-15 16:00:00+07', 'Nhà văn hóa Tổ 1', 'Họp định kỳ tháng 1', 'Họp'),
  ('Sinh hoạt cộng đồng', '2025-01-20 09:00:00+07', '2025-01-20 11:00:00+07', 'Sân chung', 'Vệ sinh môi trường', 'Sinh hoạt');
*/

-- =====================================================
-- HOÀN TẤT!
-- =====================================================
