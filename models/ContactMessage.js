const { pool } = require('../config/database');

class ContactMessage {
  static async findAll(limit = 20, offset = 0) {
    const [rows] = await pool.query(
      'SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );
    return rows;
  }

  static async countAll() {
    const [rows] = await pool.query('SELECT COUNT(*) as total FROM contact_messages');
    return rows[0].total;
  }

  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM contact_messages WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async markAsRead(id) {
    await pool.query('UPDATE contact_messages SET is_read = 1 WHERE id = ?', [id]);
  }

  static async delete(id) {
    await pool.query('DELETE FROM contact_messages WHERE id = ?', [id]);
  }

  static async getUnreadCount() {
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM contact_messages WHERE is_read = 0');
    return rows[0].count;
  }

  static async create(data) {
    const [result] = await pool.query(
      'INSERT INTO contact_messages (full_name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)',
      [data.full_name, data.email, data.phone, data.subject, data.message]
    );
    return result.insertId;
  }
}

module.exports = ContactMessage;
