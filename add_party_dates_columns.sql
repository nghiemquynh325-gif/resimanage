-- Add party_join_date and official_date columns to existing party_member_info table
-- Run this ONLY if the table already exists

ALTER TABLE party_member_info 
ADD COLUMN party_join_date DATE,
ADD COLUMN official_date DATE;
