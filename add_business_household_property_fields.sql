-- Add new business household fields to households table
-- Migration: Add business property information fields

ALTER TABLE households
ADD COLUMN IF NOT EXISTS business_area NUMERIC,
ADD COLUMN IF NOT EXISTS business_construction_year INTEGER,
ADD COLUMN IF NOT EXISTS business_floors INTEGER,
ADD COLUMN IF NOT EXISTS business_rooms INTEGER,
ADD COLUMN IF NOT EXISTS business_sector TEXT;

-- Add comments for documentation
COMMENT ON COLUMN households.business_area IS 'Diện tích (m²) - Area in square meters';
COMMENT ON COLUMN households.business_construction_year IS 'Năm xây dựng - Construction year';
COMMENT ON COLUMN households.business_floors IS 'Số tầng - Number of floors';
COMMENT ON COLUMN households.business_rooms IS 'Số phòng - Number of rooms';
COMMENT ON COLUMN households.business_sector IS 'Ngành nghề kinh doanh - Business sector';
