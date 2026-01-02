SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM 
    information_schema.columns
WHERE 
    table_name = 'households' 
    AND column_name IN ('is_poor_household', 'is_policy_household', 'poor_household_notes', 'policy_household_notes');
