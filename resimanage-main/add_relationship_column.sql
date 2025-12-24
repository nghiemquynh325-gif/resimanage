-- =====================================================
-- Add relationship column to household_members
-- =====================================================
-- This migration adds the relationship column if it doesn't exist
-- =====================================================

-- Check if column exists first
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'household_members' 
          AND column_name = 'relationship'
    ) THEN
        -- Add the relationship column
        ALTER TABLE public.household_members 
        ADD COLUMN relationship TEXT;
        
        RAISE NOTICE 'Column relationship added successfully';
    ELSE
        RAISE NOTICE 'Column relationship already exists';
    END IF;
END $$;

-- Verify the column was added
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'household_members'
ORDER BY ordinal_position;

-- Show sample data
SELECT * FROM public.household_members LIMIT 5;
