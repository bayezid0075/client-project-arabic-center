const { pool } = require('../config/database');

class Course {
  static async findAll() {
    const [rows] = await pool.query('SELECT * FROM courses ORDER BY name');
    return rows;
  }

  static async findActive() {
    const [rows] = await pool.query('SELECT * FROM courses WHERE is_active = 1 ORDER BY name');
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM courses WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async create(data) {
    const [result] = await pool.query(
      'INSERT INTO courses (name, code, description, duration, fee) VALUES (?, ?, ?, ?, ?)',
      [data.name, data.code, data.description, data.duration, data.fee]
    );
    return result.insertId;
  }

  static async update(id, data) {
    await pool.query(
      'UPDATE courses SET name=?, code=?, description=?, duration=?, fee=?, is_active=? WHERE id=?',
      [data.name, data.code, data.description, data.duration, data.fee, data.is_active, id]
    );
  }

  static async delete(id) {
    await pool.query('DELETE FROM courses WHERE id = ?', [id]);
  }
}

module.exports = Course;
