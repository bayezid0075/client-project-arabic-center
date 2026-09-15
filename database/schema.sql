CREATE DATABASE IF NOT EXISTS training_center
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE training_center;

-- Users table (admin accounts)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  role ENUM('admin', 'staff') DEFAULT 'admin',
  is_active TINYINT(1) DEFAULT 1,
  last_login DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  code VARCHAR(20) NOT NULL UNIQUE,
  description TEXT,
  duration VARCHAR(50),
  fee DECIMAL(10,2) DEFAULT 0.00,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Batches table
CREATE TABLE IF NOT EXISTS batches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  course_id INT NOT NULL,
  start_date DATE,
  end_date DATE,
  max_students INT DEFAULT 30,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Students table
CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id VARCHAR(20) NOT NULL UNIQUE,
  full_name VARCHAR(100) NOT NULL,
  father_name VARCHAR(100),
  mother_name VARCHAR(100),
  date_of_birth DATE,
  gender ENUM('male', 'female', 'other') DEFAULT 'male',
  phone VARCHAR(20),
  email VARCHAR(100),
  address TEXT,
  enrollment_date DATE,
  course_id INT,
  batch_id INT,
  status ENUM('active', 'completed', 'dropped', 'suspended') DEFAULT 'active',
  profile_photo VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL,
  FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE SET NULL,
  INDEX idx_student_id (student_id),
  INDEX idx_email (email),
  INDEX idx_phone (phone),
  INDEX idx_status (status)
) ENGINE=InnoDB;

-- Certificates table
CREATE TABLE IF NOT EXISTS certificates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  certificate_number VARCHAR(30) NOT NULL UNIQUE,
  student_id INT NOT NULL,
  course_id INT,
  batch_id INT,
  issue_date DATE,
  completion_date DATE,
  grade VARCHAR(10),
  result ENUM('pass', 'fail', 'distinction', 'merit') DEFAULT 'pass',
  status ENUM('valid', 'revoked', 'expired') DEFAULT 'valid',
  verification_code VARCHAR(50) NOT NULL UNIQUE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL,
  FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE SET NULL,
  INDEX idx_certificate_number (certificate_number),
  INDEX idx_verification_code (verification_code),
  INDEX idx_status (status)
) ENGINE=InnoDB;

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_number VARCHAR(30) NOT NULL UNIQUE,
  student_id INT NOT NULL,
  course_id INT,
  description TEXT,
  amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  discount DECIMAL(10,2) DEFAULT 0.00,
  tax_rate DECIMAL(5,2) DEFAULT 0.00,
  tax_amount DECIMAL(10,2) DEFAULT 0.00,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  paid_amount DECIMAL(10,2) DEFAULT 0.00,
  due_amount DECIMAL(10,2) DEFAULT 0.00,
  payment_status ENUM('paid', 'partial', 'pending', 'overdue', 'cancelled') DEFAULT 'pending',
  issue_date DATE,
  due_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL,
  INDEX idx_invoice_number (invoice_number),
  INDEX idx_payment_status (payment_status)
) ENGINE=InnoDB;

-- Student Issues table
CREATE TABLE IF NOT EXISTS student_issues (
  id INT AUTO_INCREMENT PRIMARY KEY,
  issue_id VARCHAR(20) NOT NULL UNIQUE,
  student_id INT NOT NULL,
  issue_type ENUM('payment', 'attendance', 'certificate', 'course', 'technical', 'administrative', 'other') DEFAULT 'other',
  subject VARCHAR(200) NOT NULL,
  description TEXT,
  priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
  assigned_to VARCHAR(100),
  resolved_date DATETIME,
  resolution_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  INDEX idx_issue_id (issue_id),
  INDEX idx_status (status),
  INDEX idx_priority (priority)
) ENGINE=InnoDB;

-- Contact Messages table
CREATE TABLE IF NOT EXISTS contact_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  subject VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  is_read TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Notices table
CREATE TABLE IF NOT EXISTS notices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  summary VARCHAR(300) DEFAULT NULL,
  content TEXT DEFAULT NULL,
  link VARCHAR(500) DEFAULT NULL,
  is_pinned TINYINT(1) DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_is_pinned (is_pinned),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
