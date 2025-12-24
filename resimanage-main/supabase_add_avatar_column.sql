-- =====================================================
-- Migration: Add missing avatar column to residents table
-- =====================================================
-- Run this script in Supabase SQL Editor to fix the avatar column error
-- =====================================================

-- Add avatar column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'residents' 
        AND column_name = 'avatar'
    ) THEN
        ALTER TABLE public.residents ADD COLUMN avatar TEXT;
        RAISE NOTICE 'Column avatar added to residents table';
    ELSE
        RAISE NOTICE 'Column avatar already exists in residents table';
    END IF;
END $$;

-- Verify the column exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'residents'
  AND column_name = 'avatar';

-- =====================================================
-- HOÀN TẤT!
-- =====================================================
-- Sau khi chạy script này, bạn có thể thêm cư dân mới
-- mà không bị lỗi "avatar column not found" nữa.
-- =====================================================
