const { pool } = require('../config/database');

class Student {
  static async findAll(search = '', limit = 20, offset = 0) {
    let query = `
      SELECT s.*, c.name as course_name, c.code as course_code, b.name as batch_name
      FROM students s
      LEFT JOIN courses c ON s.course_id = c.id
      LEFT JOIN batches b ON s.batch_id = b.id
    `;
    const params = [];

    if (search) {
      query += ` WHERE s.full_name LIKE ? OR s.student_id LIKE ? OR s.phone LIKE ? OR s.email LIKE ?`;
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    query += ` ORDER BY s.created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [rows] = await pool.query(query, params);
    return rows;
  }

  static async countAll(search = '') {
    let query = 'SELECT COUNT(*) as total FROM students';
    const params = [];

    if (search) {
      query += ` WHERE full_name LIKE ? OR student_id LIKE ? OR phone LIKE ? OR email LIKE ?`;
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    const [rows] = await pool.query(query, params);
    return rows[0].total;
  }

  static async findById(id) {
    const [rows] = await pool.query(`
      SELECT s.*, c.name as course_name, c.code as course_code, b.name as batch_name
      FROM students s
      LEFT JOIN courses c ON s.course_id = c.id
      LEFT JOIN batches b ON s.batch_id = b.id
      WHERE s.id = ?
    `, [id]);
    return rows[0] || null;
  }

  static async findByStudentId(studentId) {
    const [rows] = await pool.query('SELECT * FROM students WHERE student_id = ?', [studentId]);
    return rows[0] || null;
  }

  static async create(data) {
    const [result] = await pool.query(
      `INSERT INTO students (student_id, full_name, father_name, mother_name, date_of_birth, gender, phone, email, address, enrollment_date, course_id, batch_id, status, profile_photo, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [data.student_id, data.full_name, data.father_name, data.mother_name, data.date_of_birth, data.gender, data.phone, data.email, data.address, data.enrollment_date, data.course_id, data.batch_id, data.status, data.profile_photo, data.notes]
    );
    return result.insertId;
  }

  static async update(id, data) {
    await pool.query(
      `UPDATE students SET full_name=?, father_name=?, mother_name=?, date_of_birth=?, gender=?, phone=?, email=?, address=?, enrollment_date=?, course_id=?, batch_id=?, status=?, profile_photo=?, notes=? WHERE id=?`,
      [data.full_name, data.father_name, data.mother_name, data.date_of_birth, data.gender, data.phone, data.email, data.address, data.enrollment_date, data.course_id, data.batch_id, data.status, data.profile_photo, data.notes, id]
    );
  }

  static async delete(id) {
    await pool.query('DELETE FROM students WHERE id = ?', [id]);
  }

  static async getStats() {
    const [total] = await pool.query('SELECT COUNT(*) as count FROM students');
    const [active] = await pool.query("SELECT COUNT(*) as count FROM students WHERE status = 'active'");
    const [completed] = await pool.query("SELECT COUNT(*) as count FROM students WHERE status = 'completed'");
    return {
      total: total[0].count,
      active: active[0].count,
      completed: completed[0].count
    };
  }

  static async getRecent(limit = 5) {
    const [rows] = await pool.query(`
      SELECT s.*, c.name as course_name, b.name as batch_name
      FROM students s
      LEFT JOIN courses c ON s.course_id = c.id
      LEFT JOIN batches b ON s.batch_id = b.id
      ORDER BY s.created_at DESC LIMIT ?
    `, [limit]);
    return rows;
  }

  static async getNextStudentId() {
    const [rows] = await pool.query("SELECT student_id FROM students ORDER BY id DESC LIMIT 1");
    if (rows.length === 0) return 'STU-001';
    const lastId = rows[0].student_id;
    const num = parseInt(lastId.replace('STU-', '')) + 1;
    return `STU-${String(num).padStart(3, '0')}`;
  }
}

module.exports = Student;
