-- Add Militia and Security Force associations to the database

-- Insert Militia Force association
INSERT INTO associations (id, name, type, description, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Lực lượng Dân quân',
  'militia',
  'Quản lý lực lượng dân quân tự vệ',
  NOW(),
  NOW()
)
ON CONFLICT (type) DO NOTHING;

-- Insert Security Force association  
INSERT INTO associations (id, name, type, description, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Lực lượng ANCS',
  'security_force',
  'Quản lý lực lượng An ninh cơ sở',
  NOW(),
  NOW()
)
ON CONFLICT (type) DO NOTHING;

-- Verify the insertions
SELECT * FROM associations WHERE type IN ('militia', 'security_force');
