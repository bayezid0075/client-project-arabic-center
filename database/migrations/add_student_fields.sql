USE training_center;

-- Add registration_no and nid_no columns to students table
ALTER TABLE students
  ADD COLUMN registration_no VARCHAR(50) UNIQUE AFTER student_id,
  ADD COLUMN nid_no VARCHAR(50) AFTER gender;

-- Generate registration_no for existing students
-- Format: ATTC-{student_id}-{YYYYMMDD} using created_at date
UPDATE students
SET registration_no = CONCAT('ATTC-', student_id, '-', DATE_FORMAT(created_at, '%Y%m%d'))
WHERE registration_no IS NULL;

-- Make registration_no NOT NULL after backfilling
ALTER TABLE students MODIFY registration_no VARCHAR(50) NOT NULL;

-- Add index
ALTER TABLE students ADD INDEX idx_registration_no (registration_no);
