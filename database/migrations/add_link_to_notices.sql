-- Add link column to notices table
-- Run this SQL to add an optional link field to notices

ALTER TABLE notices ADD COLUMN link VARCHAR(500) DEFAULT NULL AFTER content;
