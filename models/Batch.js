const { pool } = require('../config/database');

class Batch {
  static async findAll() {
    const [rows] = await pool.query(`
      SELECT b.*, c.name as course_name, c.code as course_code
      FROM batches b
      LEFT JOIN courses c ON b.course_id = c.id
      ORDER BY b.created_at DESC
    `);
    return rows;
  }

  static async findActive() {
    const [rows] = await pool.query(`
      SELECT b.*, c.name as course_name
      FROM batches b
      LEFT JOIN courses c ON b.course_id = c.id
      WHERE b.is_active = 1
      ORDER BY b.name
    `);
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.query(`
      SELECT b.*, c.name as course_name
      FROM batches b
      LEFT JOIN courses c ON b.course_id = c.id
      WHERE b.id = ?
    `, [id]);
    return rows[0] || null;
  }

  static async findByCourseId(courseId) {
    const [rows] = await pool.query('SELECT * FROM batches WHERE course_id = ? AND is_active = 1', [courseId]);
    return rows;
  }

  static async create(data) {
    const [result] = await pool.query(
      'INSERT INTO batches (name, course_id, start_date, end_date, max_students) VALUES (?, ?, ?, ?, ?)',
      [data.name, data.course_id, data.start_date, data.end_date, data.max_students]
    );
    return result.insertId;
  }

  static async update(id, data) {
    await pool.query(
      'UPDATE batches SET name=?, course_id=?, start_date=?, end_date=?, max_students=?, is_active=? WHERE id=?',
      [data.name, data.course_id, data.start_date, data.end_date, data.max_students, data.is_active, id]
    );
  }

  static async delete(id) {
    await pool.query('DELETE FROM batches WHERE id = ?', [id]);
  }
}

module.exports = Batch;
