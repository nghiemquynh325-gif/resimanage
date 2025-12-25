-- =====================================================
-- Add Voting Tracking Column to Residents
-- =====================================================
-- Thêm cột theo dõi bỏ phiếu cho cư dân
-- =====================================================

-- Add has_voted column
ALTER TABLE public.residents 
ADD COLUMN IF NOT EXISTS has_voted BOOLEAN DEFAULT FALSE;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_residents_has_voted 
ON public.residents(has_voted);

-- Add index for unit (Tổ) for voting stats
CREATE INDEX IF NOT EXISTS idx_residents_unit 
ON public.residents(unit);

-- Verify column was added
SELECT 
  column_name, 
  data_type, 
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'residents' 
  AND column_name = 'has_voted';

-- Expected result: has_voted | boolean | false | YES
