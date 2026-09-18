const { pool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Certificate {
  static async findAll(search = '', limit = 20, offset = 0) {
    let query = `
      SELECT cert.*, s.full_name as student_name, s.student_id as student_code,
             c.name as course_name, c.code as course_code, b.name as batch_name
      FROM certificates cert
      LEFT JOIN students s ON cert.student_id = s.id
      LEFT JOIN courses c ON cert.course_id = c.id
      LEFT JOIN batches b ON cert.batch_id = b.id
    `;
    const params = [];

    if (search) {
      query += ` WHERE cert.certificate_number LIKE ? OR cert.verification_code LIKE ? OR s.full_name LIKE ?`;
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    query += ` ORDER BY cert.created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [rows] = await pool.query(query, params);
    return rows;
  }

  static async countAll(search = '') {
    let query = 'SELECT COUNT(*) as total FROM certificates cert LEFT JOIN students s ON cert.student_id = s.id';
    const params = [];

    if (search) {
      query += ` WHERE cert.certificate_number LIKE ? OR cert.verification_code LIKE ? OR s.full_name LIKE ?`;
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    const [rows] = await pool.query(query, params);
    return rows[0].total;
  }

  static async findById(id) {
    const [rows] = await pool.query(`
      SELECT cert.*, s.full_name as student_name, s.student_id as student_code,
             s.registration_no, s.father_name, s.passport_no, s.profile_photo,
             s.phone as student_phone, s.email as student_email,
             c.name as course_name, c.code as course_code,
             b.name as batch_name, b.start_date as batch_start_date, b.end_date as batch_end_date
      FROM certificates cert
      LEFT JOIN students s ON cert.student_id = s.id
      LEFT JOIN courses c ON cert.course_id = c.id
      LEFT JOIN batches b ON cert.batch_id = b.id
      WHERE cert.id = ?
    `, [id]);
    return rows[0] || null;
  }

  static async verify(certNumber) {
    const [rows] = await pool.query(`
      SELECT cert.*, s.full_name as student_name, s.student_id as student_code,
             c.name as course_name, c.code as course_code
      FROM certificates cert
      LEFT JOIN students s ON cert.student_id = s.id
      LEFT JOIN courses c ON cert.course_id = c.id
      WHERE cert.certificate_number = ? OR cert.verification_code = ?
    `, [certNumber, certNumber]);
    return rows[0] || null;
  }

  static async create(data) {
    const certNumber = data.certificate_number || await this.generateCertNumber();
    const verCode = data.verification_code || await this.generateVerificationCode();

    const [result] = await pool.query(
      `INSERT INTO certificates (certificate_number, student_id, course_id, batch_id, issue_date, completion_date, grade, result, status, verification_code, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [certNumber, data.student_id, data.course_id, data.batch_id, data.issue_date, data.completion_date, data.grade, data.result, data.status || 'valid', verCode, data.notes]
    );
    return result.insertId;
  }

  static async update(id, data) {
    await pool.query(
      `UPDATE certificates SET student_id=?, course_id=?, batch_id=?, issue_date=?, completion_date=?, grade=?, result=?, status=?, notes=? WHERE id=?`,
      [data.student_id, data.course_id, data.batch_id, data.issue_date, data.completion_date, data.grade, data.result, data.status, data.notes, id]
    );
  }

  static async delete(id) {
    await pool.query('DELETE FROM certificates WHERE id = ?', [id]);
  }

  static async getStats() {
    const [total] = await pool.query('SELECT COUNT(*) as count FROM certificates');
    const [valid] = await pool.query("SELECT COUNT(*) as count FROM certificates WHERE status = 'valid'");
    const [revoked] = await pool.query("SELECT COUNT(*) as count FROM certificates WHERE status = 'revoked'");
    return { total: total[0].count, valid: valid[0].count, revoked: revoked[0].count };
  }

  static async getRecent(limit = 5) {
    const [rows] = await pool.query(`
      SELECT cert.*, s.full_name as student_name, c.name as course_name
      FROM certificates cert
      LEFT JOIN students s ON cert.student_id = s.id
      LEFT JOIN courses c ON cert.course_id = c.id
      ORDER BY cert.created_at DESC LIMIT ?
    `, [limit]);
    return rows;
  }

  static async generateCertNumber() {
    const year = new Date().getFullYear();
    const [rows] = await pool.query("SELECT certificate_number FROM certificates WHERE certificate_number LIKE ? ORDER BY id DESC LIMIT 1", [`CERT-${year}-%`]);
    if (rows.length === 0) return `CERT-${year}-000001`;
    const lastNum = parseInt(rows[0].certificate_number.split('-').pop());
    return `CERT-${year}-${String(lastNum + 1).padStart(6, '0')}`;
  }

  static async generateVerificationCode() {
    return 'VC-' + uuidv4().replace(/-/g, '').substring(0, 12).toUpperCase();
  }
}

module.exports = Certificate;
