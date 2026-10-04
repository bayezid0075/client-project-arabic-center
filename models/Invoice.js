const { pool } = require('../config/database');

class Invoice {
  static async findAll(search = '', limit = 20, offset = 0) {
    let query = `
      SELECT inv.*, s.full_name as student_name, s.student_id as student_code,
             c.name as course_name
      FROM invoices inv
      LEFT JOIN students s ON inv.student_id = s.id
      LEFT JOIN courses c ON inv.course_id = c.id
    `;
    const params = [];

    if (search) {
      query += ` WHERE inv.invoice_number LIKE ? OR s.full_name LIKE ? OR inv.payment_status LIKE ?`;
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    query += ` ORDER BY inv.created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [rows] = await pool.query(query, params);
    return rows;
  }

  static async countAll(search = '') {
    let query = 'SELECT COUNT(*) as total FROM invoices inv LEFT JOIN students s ON inv.student_id = s.id';
    const params = [];

    if (search) {
      query += ` WHERE inv.invoice_number LIKE ? OR s.full_name LIKE ? OR inv.payment_status LIKE ?`;
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    const [rows] = await pool.query(query, params);
    return rows[0].total;
  }

  static async findById(id) {
    const [rows] = await pool.query(`
      SELECT inv.*, s.full_name as student_name, s.student_id as student_code,
             s.father_name, s.phone as student_phone, s.email as student_email, s.address as student_address,
             c.name as course_name, c.code as course_code
      FROM invoices inv
      LEFT JOIN students s ON inv.student_id = s.id
      LEFT JOIN courses c ON inv.course_id = c.id
      WHERE inv.id = ?
    `, [id]);
    return rows[0] || null;
  }

  static computeTotals(data) {
    const amount = parseFloat(data.amount) || 0;
    const discount = parseFloat(data.discount) || 0;
    const taxRate = parseFloat(data.tax_rate) || 0;
    const subtotal = amount - discount;
    const taxAmount = subtotal * (taxRate / 100);
    const totalAmount = subtotal + taxAmount;
    const paidAmount = parseFloat(data.paid_amount) || 0;
    const dueAmount = totalAmount - paidAmount;
    return { amount, discount, taxRate, taxAmount, totalAmount, paidAmount, dueAmount };
  }

  static async create(data) {
    const { amount, discount, taxRate, taxAmount, totalAmount, paidAmount, dueAmount } = Invoice.computeTotals(data);

    let paymentStatus = 'pending';
    if (dueAmount <= 0) paymentStatus = 'paid';
    else if (paidAmount > 0) paymentStatus = 'partial';

    const [result] = await pool.query(
      `INSERT INTO invoices (invoice_number, student_id, course_id, description, amount, discount, tax_rate, tax_amount, total_amount, paid_amount, due_amount, payment_status, issue_date, due_date, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [data.invoice_number, data.student_id, data.course_id, data.description, amount, discount, taxRate, taxAmount, totalAmount, paidAmount, dueAmount, paymentStatus, data.issue_date, data.due_date || null, data.notes]
    );
    return result.insertId;
  }

  static async update(id, data) {
    const { amount, discount, taxRate, taxAmount, totalAmount, paidAmount, dueAmount } = Invoice.computeTotals(data);

    let paymentStatus = data.payment_status || 'pending';

    await pool.query(
      `UPDATE invoices SET invoice_number=?, student_id=?, course_id=?, description=?, amount=?, discount=?, tax_rate=?, tax_amount=?, total_amount=?, paid_amount=?, due_amount=?, payment_status=?, issue_date=?, due_date=?, notes=? WHERE id=?`,
      [data.invoice_number, data.student_id, data.course_id, data.description, amount, discount, taxRate, taxAmount, totalAmount, paidAmount, dueAmount, paymentStatus, data.issue_date, data.due_date, data.notes, id]
    );
  }

  static async delete(id) {
    await pool.query('DELETE FROM invoices WHERE id = ?', [id]);
  }

  static async findByStudent(studentId, limit = 100) {
    const [rows] = await pool.query(`
      SELECT inv.*, c.name as course_name
      FROM invoices inv
      LEFT JOIN courses c ON inv.course_id = c.id
      WHERE inv.student_id = ?
      ORDER BY inv.created_at DESC
      LIMIT ?
    `, [studentId, limit]);
    return rows;
  }

  static async getInvoicedTotal(studentId, excludeInvoiceId = null) {
    let query = `SELECT COALESCE(SUM(total_amount), 0) as total
                 FROM invoices
                 WHERE student_id = ? AND payment_status <> 'cancelled'`;
    const params = [studentId];

    if (excludeInvoiceId) {
      query += ' AND id <> ?';
      params.push(excludeInvoiceId);
    }

    const [rows] = await pool.query(query, params);
    return parseFloat(rows[0].total) || 0;
  }

  static async attachBilling(rows, excludeInvoiceId = null) {
    if (!rows || rows.length === 0) return rows || [];

    let query = `SELECT student_id, COALESCE(SUM(total_amount), 0) as total
                 FROM invoices
                 WHERE payment_status <> 'cancelled'`;
    const params = [];

    if (excludeInvoiceId) {
      query += ' AND id <> ?';
      params.push(excludeInvoiceId);
    }

    query += ' GROUP BY student_id';

    const [totals] = await pool.query(query, params);
    const map = {};
    totals.forEach(t => { map[t.student_id] = parseFloat(t.total) || 0; });

    rows.forEach(row => {
      const fee = parseFloat(row.course_fee) || 0;
      const invoiced = map[row.id] || 0;
      row.course_fee = fee;
      row.invoiced_total = invoiced;
      row.due_amount = fee > 0 ? Math.max(0, fee - invoiced) : 0;
      row.has_billing_limit = fee > 0;
    });

    return rows;
  }

  static async getStats() {
    const [total] = await pool.query('SELECT COUNT(*) as count FROM invoices');
    const [pending] = await pool.query("SELECT COUNT(*) as count FROM invoices WHERE payment_status = 'pending'");
    const [paid] = await pool.query("SELECT COUNT(*) as count FROM invoices WHERE payment_status = 'paid'");
    const [overdue] = await pool.query("SELECT COUNT(*) as count FROM invoices WHERE payment_status = 'overdue'");
    const [totalRevenue] = await pool.query('SELECT COALESCE(SUM(total_amount), 0) as total FROM invoices');
    const [totalCollected] = await pool.query('SELECT COALESCE(SUM(paid_amount), 0) as total FROM invoices');
    return {
      total: total[0].count,
      pending: pending[0].count,
      paid: paid[0].count,
      overdue: overdue[0].count,
      totalRevenue: totalRevenue[0].total,
      totalCollected: totalCollected[0].total
    };
  }

  static async getRecent(limit = 5) {
    const [rows] = await pool.query(`
      SELECT inv.*, s.full_name as student_name, c.name as course_name
      FROM invoices inv
      LEFT JOIN students s ON inv.student_id = s.id
      LEFT JOIN courses c ON inv.course_id = c.id
      ORDER BY inv.created_at DESC LIMIT ?
    `, [limit]);
    return rows;
  }

  static async generateInvoiceNumber() {
    const year = new Date().getFullYear();
    const [rows] = await pool.query("SELECT invoice_number FROM invoices WHERE invoice_number LIKE ? ORDER BY id DESC LIMIT 1", [`INV-${year}-%`]);
    if (rows.length === 0) return `INV-${year}-000001`;
    const lastNum = parseInt(rows[0].invoice_number.split('-').pop());
    return `INV-${year}-${String(lastNum + 1).padStart(6, '0')}`;
  }
}

module.exports = Invoice;
