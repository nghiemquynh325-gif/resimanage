-- Add comprehensive business property fields to households table
-- Migration: Add land certificate and property detail fields

ALTER TABLE households
-- Land Certificate Information
ADD COLUMN IF NOT EXISTS land_plot_number TEXT,
ADD COLUMN IF NOT EXISTS land_map_sheet_number TEXT,
ADD COLUMN IF NOT EXISTS certificate_issue_number TEXT,
ADD COLUMN IF NOT EXISTS certificate_registry_number TEXT,

-- Property Details (some may already exist from previous migration)
ADD COLUMN IF NOT EXISTS business_area NUMERIC,
ADD COLUMN IF NOT EXISTS business_construction_year INTEGER,
ADD COLUMN IF NOT EXISTS business_floors INTEGER,
ADD COLUMN IF NOT EXISTS business_rooms INTEGER,
ADD COLUMN IF NOT EXISTS business_sector TEXT;

-- Add comments for documentation
COMMENT ON COLUMN households.land_plot_number IS 'Thửa đất số - Land plot number';
COMMENT ON COLUMN households.land_map_sheet_number IS 'Tờ bản đồ số - Map sheet number';
COMMENT ON COLUMN households.certificate_issue_number IS 'Số phát hành GCN - Certificate issue number';
COMMENT ON COLUMN households.certificate_registry_number IS 'Số vào sổ cấp giấy - Certificate registry number';
COMMENT ON COLUMN households.business_area IS 'Diện tích (m²) - Area in square meters';
COMMENT ON COLUMN households.business_construction_year IS 'Năm xây dựng - Construction year';
COMMENT ON COLUMN households.business_floors IS 'Số tầng - Number of floors';
COMMENT ON COLUMN households.business_rooms IS 'Số phòng - Number of rooms';
COMMENT ON COLUMN households.business_sector IS 'Ngành nghề kinh doanh - Business sector';
