-- Test data for military info feature
-- Run this AFTER you have:
-- 1. Created military_info table (run setup_military_info.sql)
-- 2. Added at least one member to "Quân nhân xuất ngũ" association via UI

-- First, find the discharged_military association ID
DO $$
DECLARE
  v_association_id UUID;
  v_resident_id UUID;
  v_member_id UUID;
BEGIN
  -- Get discharged_military association ID
  SELECT id INTO v_association_id 
  FROM associations 
  WHERE type = 'discharged_military' 
  LIMIT 1;

  -- Get a random active resident
  SELECT id INTO v_resident_id 
  FROM residents 
  WHERE status IN ('active', 'Thường trú') 
  LIMIT 1;

  -- Check if we have both IDs
  IF v_association_id IS NOT NULL AND v_resident_id IS NOT NULL THEN
    -- Add resident to association if not already a member
    INSERT INTO association_members (association_id, resident_id, role, joined_date)
    VALUES (v_association_id, v_resident_id, 'member', CURRENT_DATE)
    ON CONFLICT (association_id, resident_id) DO NOTHING
    RETURNING id INTO v_member_id;

    -- If member was just created, get the ID
    IF v_member_id IS NULL THEN
      SELECT id INTO v_member_id
      FROM association_members
      WHERE association_id = v_association_id AND resident_id = v_resident_id;
    END IF;

    -- Add military info for this member
    INSERT INTO military_info (
      association_member_id,
      enlistment_date,
      discharge_date,
      rank,
      position,
      military_specialty,
      last_unit
    ) VALUES (
      v_member_id,
      '2010-01-15',
      '2015-12-20',
      'Trung sĩ',
      'Tiểu đội trưởng',
      'Bộ binh',
      'Trung đoàn 5, Sư đoàn 3'
    )
    ON CONFLICT (association_member_id) DO UPDATE SET
      enlistment_date = EXCLUDED.enlistment_date,
      discharge_date = EXCLUDED.discharge_date,
      rank = EXCLUDED.rank,
      position = EXCLUDED.position,
      military_specialty = EXCLUDED.military_specialty,
      last_unit = EXCLUDED.last_unit;

    RAISE NOTICE 'Successfully added test military info for member ID: %', v_member_id;
  ELSE
    RAISE NOTICE 'Missing association or resident. Association ID: %, Resident ID: %', v_association_id, v_resident_id;
  END IF;
END $$;
