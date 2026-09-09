const { pool } = require('../config/database');

class StudentIssue {
  static async findAll(search = '', limit = 20, offset = 0) {
    let query = `
      SELECT si.*, s.full_name as student_name, s.student_id as student_code
      FROM student_issues si
      LEFT JOIN students s ON si.student_id = s.id
    `;
    const params = [];

    if (search) {
      query += ` WHERE si.issue_id LIKE ? OR s.full_name LIKE ? OR si.subject LIKE ? OR si.status LIKE ? OR si.priority LIKE ?`;
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
    }

    query += ` ORDER BY si.created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [rows] = await pool.query(query, params);
    return rows;
  }

  static async countAll(search = '') {
    let query = 'SELECT COUNT(*) as total FROM student_issues si LEFT JOIN students s ON si.student_id = s.id';
    const params = [];

    if (search) {
      query += ` WHERE si.issue_id LIKE ? OR s.full_name LIKE ? OR si.subject LIKE ? OR si.status LIKE ? OR si.priority LIKE ?`;
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
    }

    const [rows] = await pool.query(query, params);
    return rows[0].total;
  }

  static async findById(id) {
    const [rows] = await pool.query(`
      SELECT si.*, s.full_name as student_name, s.student_id as student_code,
             s.phone as student_phone, s.email as student_email
      FROM student_issues si
      LEFT JOIN students s ON si.student_id = s.id
      WHERE si.id = ?
    `, [id]);
    return rows[0] || null;
  }

  static async create(data) {
    const issueId = data.issue_id || await this.generateIssueId();
    const [result] = await pool.query(
      `INSERT INTO student_issues (issue_id, student_id, issue_type, subject, description, priority, status, assigned_to)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [issueId, data.student_id, data.issue_type, data.subject, data.description, data.priority || 'medium', data.status || 'open', data.assigned_to]
    );
    return result.insertId;
  }

  static async update(id, data) {
    const resolvedDate = data.status === 'resolved' ? new Date() : null;
    await pool.query(
      `UPDATE student_issues SET student_id=?, issue_type=?, subject=?, description=?, priority=?, status=?, assigned_to=?, resolved_date=?, resolution_notes=? WHERE id=?`,
      [data.student_id, data.issue_type, data.subject, data.description, data.priority, data.status, data.assigned_to, resolvedDate, data.resolution_notes, id]
    );
  }

  static async delete(id) {
    await pool.query('DELETE FROM student_issues WHERE id = ?', [id]);
  }

  static async getStats() {
    const [total] = await pool.query('SELECT COUNT(*) as count FROM student_issues');
    const [open] = await pool.query("SELECT COUNT(*) as count FROM student_issues WHERE status = 'open'");
    const [inProgress] = await pool.query("SELECT COUNT(*) as count FROM student_issues WHERE status = 'in_progress'");
    const [resolved] = await pool.query("SELECT COUNT(*) as count FROM student_issues WHERE status = 'resolved'");
    return { total: total[0].count, open: open[0].count, inProgress: inProgress[0].count, resolved: resolved[0].count };
  }

  static async getRecent(limit = 5) {
    const [rows] = await pool.query(`
      SELECT si.*, s.full_name as student_name
      FROM student_issues si
      LEFT JOIN students s ON si.student_id = s.id
      ORDER BY si.created_at DESC LIMIT ?
    `, [limit]);
    return rows;
  }

  static async generateIssueId() {
    const [rows] = await pool.query("SELECT issue_id FROM student_issues ORDER BY id DESC LIMIT 1");
    if (rows.length === 0) return 'ISS-001';
    const lastNum = parseInt(rows[0].issue_id.replace('ISS-', ''));
    return `ISS-${String(lastNum + 1).padStart(3, '0')}`;
  }
}

module.exports = StudentIssue;
