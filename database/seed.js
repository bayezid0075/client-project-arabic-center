const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');

async function seed() {
  const connection = await pool.getConnection();

  try {
    console.log('[SEED] Starting database seed...');

    const schema = require('fs').readFileSync(
      require('path').join(__dirname, 'schema.sql'),
      'utf8'
    );

    const statements = schema.split(';').filter(s => s.trim());
    for (const stmt of statements) {
      if (stmt.trim()) {
        await connection.query(stmt);
      }
    }
    console.log('[SEED] Schema applied');

    const [existingUsers] = await connection.query('SELECT COUNT(*) as count FROM users');
    if (existingUsers[0].count > 0) {
      console.log('[SEED] Data already exists, skipping seed');
      connection.release();
      return;
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);

    await connection.query(
      `INSERT INTO users (username, email, password, full_name, role) VALUES (?, ?, ?, ?, ?)`,
      ['admin', 'admin@trainingcenter.com', hashedPassword, 'System Administrator', 'admin']
    );
    console.log('[SEED] Admin user created');

    const courses = [
      ['Web Development', 'WEB101', 'Comprehensive full-stack web development program covering HTML, CSS, JavaScript, Node.js, and databases.', '6 months', 45000.00],
      ['Graphic Design', 'GFX201', 'Professional graphic design course covering Adobe Creative Suite, typography, and visual communication.', '4 months', 35000.00],
      ['Digital Marketing', 'DMK301', 'Complete digital marketing training including SEO, social media, PPC, and analytics.', '3 months', 28000.00],
      ['Data Science', 'DSC401', 'Data analysis, visualization, machine learning, and statistical modeling with Python.', '6 months', 55000.00],
      ['Mobile App Development', 'MAD501', 'Cross-platform mobile development using React Native and Flutter.', '5 months', 42000.00],
      ['Network Administration', 'NET601', 'Network setup, security, and administration with hands-on lab experience.', '4 months', 38000.00]
    ];

    for (const c of courses) {
      await connection.query(
        'INSERT INTO courses (name, code, description, duration, fee) VALUES (?, ?, ?, ?, ?)',
        c
      );
    }
    console.log('[SEED] Courses created');

    const batches = [
      ['Batch A - Morning', 1, '2026-01-15', '2026-07-15', 30],
      ['Batch B - Evening', 1, '2026-02-01', '2026-08-01', 30],
      ['Batch A - Morning', 2, '2026-01-20', '2026-05-20', 25],
      ['Batch A - Morning', 3, '2026-03-01', '2026-06-01', 35],
      ['Batch A - Morning', 4, '2026-01-10', '2026-07-10', 20],
      ['Batch A - Morning', 5, '2026-02-15', '2026-07-15', 25],
      ['Batch A - Morning', 6, '2026-01-05', '2026-05-05', 30]
    ];

    for (const b of batches) {
      await connection.query(
        'INSERT INTO batches (name, course_id, start_date, end_date, max_students) VALUES (?, ?, ?, ?, ?)',
        b
      );
    }
    console.log('[SEED] Batches created');

    const students = [
      ['STU-001', 'Ahmed Hassan', 'Mohammed Hassan', 'Fatima Hassan', '1998-05-12', 'male', '+8801712345678', 'ahmed@email.com', '123 Main St, Dhaka', '2026-01-15', 1, 1, 'active'],
      ['STU-002', 'Fatima Khan', 'Ali Khan', 'Zainab Khan', '1999-08-22', 'female', '+8801812345678', 'fatima@email.com', '456 Oak Ave, Dhaka', '2026-01-15', 1, 1, 'active'],
      ['STU-003', 'Rahman Ali', 'Karim Ali', 'Amina Ali', '1997-03-10', 'male', '+8801912345678', 'rahman@email.com', '789 Pine Rd, Chittagong', '2026-02-01', 1, 2, 'active'],
      ['STU-004', 'Sara Ahmed', 'Hassan Ahmed', 'Rokia Ahmed', '2000-11-05', 'female', '+8801612345678', 'sara@email.com', '321 Elm St, Sylhet', '2026-01-20', 2, 3, 'active'],
      ['STU-005', 'Kamal Hossain', 'Nur Hossain', 'Jamila Hossain', '1996-07-18', 'male', '+8801512345678', 'kamal@email.com', '654 Maple Dr, Rajshahi', '2026-03-01', 3, 4, 'active'],
      ['STU-006', 'Nadia Rahman', 'Ibrahim Rahman', 'Salma Rahman', '1999-01-25', 'female', '+8801312345678', 'nadia@email.com', '987 Cedar Ln, Khulna', '2026-01-10', 4, 5, 'completed'],
      ['STU-007', 'Tanvir Islam', 'Rafiq Islam', 'Nasrin Islam', '1998-09-14', 'male', '+8801412345678', 'tanvir@email.com', '147 Birch Way, Barishal', '2026-02-15', 5, 6, 'active'],
      ['STU-008', 'Maliha Begum', 'Abdul Begum', 'Rashida Begum', '2001-04-30', 'female', '+8801212345678', 'maliha@email.com', '258 Walnut St, Rangpur', '2026-01-05', 6, 7, 'active']
    ];

    for (const s of students) {
      await connection.query(
        `INSERT INTO students (student_id, full_name, father_name, mother_name, date_of_birth, gender, phone, email, address, enrollment_date, course_id, batch_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        s
      );
    }
    console.log('[SEED] Students created');

    const certificates = [
      ['CERT-2026-000001', 6, 4, 5, '2026-06-15', '2026-06-15', 'A', 'distinction', 'valid', 'VC-2026-A1B2C3'],
      ['CERT-2026-000002', 1, 1, 1, '2026-06-20', '2026-06-20', 'B+', 'pass', 'valid', 'VC-2026-D4E5F6'],
      ['CERT-2026-000003', 2, 1, 1, '2026-06-25', '2026-06-25', 'A-', 'merit', 'valid', 'VC-2026-G7H8I9'],
      ['CERT-2026-000004', 3, 1, 2, '2026-06-10', '2026-06-10', 'B', 'pass', 'revoked', 'VC-2026-J0K1L2']
    ];

    for (const c of certificates) {
      await connection.query(
        `INSERT INTO certificates (certificate_number, student_id, course_id, batch_id, issue_date, completion_date, grade, result, status, verification_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        c
      );
    }
    console.log('[SEED] Certificates created');

    const invoices = [
      ['INV-2026-000001', 1, 1, 'Web Development Course - Full Program', 45000.00, 5000.00, 5.00, 2000.00, 42000.00, 42000.00, 0.00, 'paid', '2026-01-15', '2026-02-15', 'Early bird discount applied'],
      ['INV-2026-000002', 2, 1, 'Web Development Course - Full Program', 45000.00, 0.00, 5.00, 2250.00, 47250.00, 25000.00, 22250.00, 'partial', '2026-01-15', '2026-02-15', null],
      ['INV-2026-000003', 3, 1, 'Web Development Course - Full Program', 45000.00, 0.00, 5.00, 2250.00, 47250.00, 0.00, 47250.00, 'pending', '2026-02-01', '2026-03-01', null],
      ['INV-2026-000004', 4, 2, 'Graphic Design Course - Full Program', 35000.00, 3000.00, 5.00, 1600.00, 33600.00, 33600.00, 0.00, 'paid', '2026-01-20', '2026-02-20', 'Scholarship discount'],
      ['INV-2026-000005', 5, 3, 'Digital Marketing Course - Full Program', 28000.00, 0.00, 5.00, 1400.00, 29400.00, 15000.00, 14400.00, 'partial', '2026-03-01', '2026-04-01', null]
    ];

    for (const inv of invoices) {
      await connection.query(
        `INSERT INTO invoices (invoice_number, student_id, course_id, description, amount, discount, tax_rate, tax_amount, total_amount, paid_amount, due_amount, payment_status, issue_date, due_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        inv
      );
    }
    console.log('[SEED] Invoices created');

    const issues = [
      ['ISS-001', 3, 'payment', 'Outstanding Payment Reminder', 'Student has not made any payment for enrollment. Follow up required.', 'high', 'open', null],
      ['ISS-002', 2, 'certificate', 'Certificate Name Correction', 'Student reported an error in name spelling on certificate.', 'medium', 'in_progress', 'Admin'],
      ['ISS-003', 5, 'attendance', 'Low Attendance Warning', 'Student attendance dropped below 75%. Notify student and guardian.', 'high', 'open', null],
      ['ISS-004', 1, 'course', 'Course Transfer Request', 'Student wants to transfer from Web Dev batch A to batch B.', 'low', 'resolved', 'Admin']
    ];

    for (const i of issues) {
      await connection.query(
        `INSERT INTO student_issues (issue_id, student_id, issue_type, subject, description, priority, status, assigned_to) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        i
      );
    }
    console.log('[SEED] Issues created');

    console.log('[SEED] Seed completed successfully!');
    console.log('[SEED] Login credentials: admin / admin123');

  } catch (error) {
    console.error('[SEED] Error:', error.message);
  } finally {
    connection.release();
    await pool.end();
  }
}

seed();
