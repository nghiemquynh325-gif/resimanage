-- Step 1: Add residence_type column
ALTER TABLE residents ADD COLUMN IF NOT EXISTS residence_type TEXT;
