USE training_center;

-- Add passport_no column to students table
ALTER TABLE students ADD COLUMN passport_no VARCHAR(50) AFTER nid_no;
