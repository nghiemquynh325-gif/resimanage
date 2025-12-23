-- Find duplicate residents by phone number
SELECT 
  phone_number,
  COUNT(*) as duplicate_count,
  STRING_AGG(id::text, ', ') as resident_ids,
  STRING_AGG(full_name, ', ') as names,
  STRING_AGG(unit, ', ') as units
FROM residents
WHERE phone_number IS NOT NULL AND phone_number != ''
GROUP BY phone_number
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- Find duplicate residents by identity card
SELECT 
  identity_card,
  COUNT(*) as duplicate_count,
  STRING_AGG(id::text, ', ') as resident_ids,
  STRING_AGG(full_name, ', ') as names
FROM residents
WHERE identity_card IS NOT NULL AND identity_card != ''
GROUP BY identity_card
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- Find potential duplicates by name + DOB
SELECT 
  full_name,
  dob,
  COUNT(*) as duplicate_count,
  STRING_AGG(id::text, ', ') as resident_ids,
  STRING_AGG(phone_number, ', ') as phone_numbers
FROM residents
GROUP BY full_name, dob
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- Detailed view of phone duplicates with all info
SELECT 
  r1.id,
  r1.full_name,
  r1.phone_number,
  r1.identity_card,
  r1.unit,
  r1.address,
  r1.status,
  r1.residence_type,
  r1.created_at
FROM residents r1
WHERE EXISTS (
  SELECT 1 
  FROM residents r2 
  WHERE r2.phone_number = r1.phone_number 
  AND r2.id != r1.id
)
ORDER BY r1.phone_number, r1.created_at;
