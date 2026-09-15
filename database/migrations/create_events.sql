-- Events table migration
-- Run this SQL to create the events table

CREATE TABLE IF NOT EXISTS events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(250) NOT NULL UNIQUE,
  summary VARCHAR(500) DEFAULT NULL,
  content TEXT DEFAULT NULL,
  image VARCHAR(500) DEFAULT NULL,
  location VARCHAR(300) DEFAULT NULL,
  event_date DATE NOT NULL,
  event_time TIME DEFAULT NULL,
  end_date DATE DEFAULT NULL,
  end_time TIME DEFAULT NULL,
  registration_link VARCHAR(500) DEFAULT NULL,
  is_featured TINYINT(1) DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_event_date (event_date),
  INDEX idx_is_active (is_active),
  INDEX idx_is_featured (is_featured),
  INDEX idx_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
