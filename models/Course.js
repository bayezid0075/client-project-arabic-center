const { pool } = require('../config/database');

class Course {
  static async findAll(search = '', limit = 20, offset = 0) {
    let query = `
      SELECT c.*, 
        (SELECT COUNT(*) FROM students s WHERE s.course_id = c.id) as student_count,
        (SELECT COUNT(*) FROM batches b WHERE b.course_id = c.id) as batch_count,
        (SELECT GROUP_CONCAT(b.name SEPARATOR ', ') FROM batches b WHERE b.course_id = c.id) as batch_names
      FROM courses c
    `;
    const params = [];

    if (search) {
      query += ' WHERE c.name LIKE ? OR c.code LIKE ? OR c.description LIKE ?';
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    query += ' ORDER BY c.name';
    query += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await pool.query(query, params);
    return rows;
  }

  static async countAll(search = '') {
    let query = 'SELECT COUNT(*) as total FROM courses c';
    const params = [];

    if (search) {
      query += ' WHERE c.name LIKE ? OR c.code LIKE ? OR c.description LIKE ?';
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    const [rows] = await pool.query(query, params);
    return rows[0].total;
  }

  static async findActive() {
    const [rows] = await pool.query('SELECT * FROM courses WHERE is_active = 1 ORDER BY name');
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.query(`
      SELECT c.*,
        (SELECT COUNT(*) FROM students s WHERE s.course_id = c.id) as student_count,
        (SELECT COUNT(*) FROM batches b WHERE b.course_id = c.id) as batch_count
      FROM courses c
      WHERE c.id = ?
    `, [id]);
    return rows[0] || null;
  }

  static async create(data) {
    const [result] = await pool.query(
      'INSERT INTO courses (name, code, description, duration, fee) VALUES (?, ?, ?, ?, ?)',
      [data.name, data.code, data.description || null, data.duration || null, data.fee || 0]
    );
    return result.insertId;
  }

  static async update(id, data) {
    await pool.query(
      'UPDATE courses SET name=?, code=?, description=?, duration=?, fee=?, is_active=? WHERE id=?',
      [data.name, data.code, data.description || null, data.duration || null, data.fee || 0, data.is_active ? 1 : 0, id]
    );
  }

  static async delete(id) {
    await pool.query('DELETE FROM courses WHERE id = ?', [id]);
  }

  static async getStats() {
    const [rows] = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(is_active = 1) as active,
        SUM(is_active = 0) as inactive
      FROM courses
    `);
    return rows[0];
  }

  static async getRecent(limit = 5) {
    const [rows] = await pool.query(`
      SELECT c.*,
        (SELECT COUNT(*) FROM students s WHERE s.course_id = c.id) as student_count
      FROM courses c
      ORDER BY c.created_at DESC
      LIMIT ?
    `, [limit]);
    return rows;
  }
}

module.exports = Course;
