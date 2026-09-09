const { pool } = require('../config/database');

class User {
  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async findByUsername(username) {
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    return rows[0] || null;
  }

  static async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
  }

  static async create(userData) {
    const [result] = await pool.query(
      'INSERT INTO users (username, email, password, full_name, role) VALUES (?, ?, ?, ?, ?)',
      [userData.username, userData.email, userData.password, userData.full_name, userData.role || 'admin']
    );
    return result.insertId;
  }

  static async updateLastLogin(id) {
    await pool.query('UPDATE users SET last_login = NOW() WHERE id = ?', [id]);
  }
}

module.exports = User;
