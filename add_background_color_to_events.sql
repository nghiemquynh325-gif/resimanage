-- Add backgroundColor column to events table
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS background_color TEXT DEFAULT '#3B82F6';

-- Verify the column was added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'events' 
  AND column_name = 'background_color';

-- Update existing events with default color
UPDATE events
SET background_color = '#3B82F6'
WHERE background_color IS NULL;
