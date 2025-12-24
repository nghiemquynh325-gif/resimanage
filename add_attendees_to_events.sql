-- =====================================================
-- Add Attendees Column to Events Table
-- =====================================================
-- Script này thêm cột "attendees" vào bảng events
-- =====================================================

-- Thêm cột attendees
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS attendees TEXT;

-- Verify: Kiểm tra cột đã được tạo
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'events'
  AND column_name = 'attendees';
