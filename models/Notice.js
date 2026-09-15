const { pool } = require('../config/database');

class Notice {
  static async findAll(search = '', limit = 20, offset = 0) {
    let query = 'SELECT * FROM notices';
    const params = [];

    if (search) {
      query += ' WHERE title LIKE ? OR summary LIKE ?';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY is_pinned DESC, created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await pool.query(query, params);
    return rows;
  }

  static async countAll(search = '') {
    let query = 'SELECT COUNT(*) as total FROM notices';
    const params = [];

    if (search) {
      query += ' WHERE title LIKE ? OR summary LIKE ?';
      params.push(`%${search}%`, `%${search}%`);
    }

    const [rows] = await pool.query(query, params);
    return rows[0].total;
  }

  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM notices WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async findActive() {
    const [rows] = await pool.query(
      'SELECT * FROM notices WHERE is_active = 1 ORDER BY is_pinned DESC, created_at DESC LIMIT 10'
    );
    return rows;
  }

  static async create(data) {
    const [result] = await pool.query(
      'INSERT INTO notices (title, summary, content, link, is_pinned, is_active) VALUES (?, ?, ?, ?, ?, ?)',
      [data.title, data.summary || '', data.content || '', data.link || null, data.is_pinned ? 1 : 0, data.is_active !== false ? 1 : 0]
    );
    return result.insertId;
  }

  static async update(id, data) {
    await pool.query(
      'UPDATE notices SET title = ?, summary = ?, content = ?, link = ?, is_pinned = ?, is_active = ? WHERE id = ?',
      [data.title, data.summary || '', data.content || '', data.link || null, data.is_pinned ? 1 : 0, data.is_active !== false ? 1 : 0, id]
    );
  }

  static async delete(id) {
    await pool.query('DELETE FROM notices WHERE id = ?', [id]);
  }
}

module.exports = Notice;
