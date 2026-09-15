const { pool } = require('../config/database');

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

class Event {
  static async findAll(search = '', limit = 20, offset = 0) {
    let query = 'SELECT * FROM events';
    const params = [];

    if (search) {
      query += ' WHERE title LIKE ? OR summary LIKE ? OR location LIKE ?';
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    query += ' ORDER BY event_date DESC, created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await pool.query(query, params);
    return rows;
  }

  static async countAll(search = '') {
    let query = 'SELECT COUNT(*) as total FROM events';
    const params = [];

    if (search) {
      query += ' WHERE title LIKE ? OR summary LIKE ? OR location LIKE ?';
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    const [rows] = await pool.query(query, params);
    return rows[0].total;
  }

  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM events WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async findBySlug(slug) {
    const [rows] = await pool.query('SELECT * FROM events WHERE slug = ?', [slug]);
    return rows[0] || null;
  }

  static async findActive(limit = 20, offset = 0) {
    const [rows] = await pool.query(
      'SELECT * FROM events WHERE is_active = 1 ORDER BY event_date DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );
    return rows;
  }

  static async findActiveCount() {
    const [rows] = await pool.query('SELECT COUNT(*) as total FROM events WHERE is_active = 1');
    return rows[0].total;
  }

  static async findFeatured(limit = 3) {
    const [rows] = await pool.query(
      'SELECT * FROM events WHERE is_active = 1 AND is_featured = 1 ORDER BY event_date DESC LIMIT ?',
      [limit]
    );
    return rows;
  }

  static async findUpcoming(limit = 5) {
    const [rows] = await pool.query(
      'SELECT * FROM events WHERE is_active = 1 AND event_date >= CURDATE() ORDER BY event_date ASC LIMIT ?',
      [limit]
    );
    return rows;
  }

  static async create(data) {
    let slug = slugify(data.title);
    const [existing] = await pool.query('SELECT id FROM events WHERE slug = ?', [slug]);
    if (existing.length > 0) {
      slug = slug + '-' + Date.now();
    }

    const [result] = await pool.query(
      `INSERT INTO events (title, slug, summary, content, image, location, event_date, event_time, end_date, end_time, registration_link, is_featured, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.title,
        slug,
        data.summary || null,
        data.content || null,
        data.image || null,
        data.location || null,
        data.event_date,
        data.event_time || null,
        data.end_date || null,
        data.end_time || null,
        data.registration_link || null,
        data.is_featured ? 1 : 0,
        data.is_active !== false ? 1 : 0
      ]
    );
    return { id: result.insertId, slug };
  }

  static async update(id, data) {
    let slug = slugify(data.title);
    const [existing] = await pool.query('SELECT id, slug FROM events WHERE slug = ? AND id != ?', [slug, id]);
    if (existing.length > 0) {
      slug = slug + '-' + Date.now();
    }

    await pool.query(
      `UPDATE events SET title=?, slug=?, summary=?, content=?, image=?, location=?, event_date=?, event_time=?, end_date=?, end_time=?, registration_link=?, is_featured=?, is_active=? WHERE id=?`,
      [
        data.title,
        slug,
        data.summary || null,
        data.content || null,
        data.image || null,
        data.location || null,
        data.event_date,
        data.event_time || null,
        data.end_date || null,
        data.end_time || null,
        data.registration_link || null,
        data.is_featured ? 1 : 0,
        data.is_active !== false ? 1 : 0,
        id
      ]
    );
    return slug;
  }

  static async delete(id) {
    const event = await Event.findById(id);
    await pool.query('DELETE FROM events WHERE id = ?', [id]);
    return event;
  }

  static async getStats() {
    const [rows] = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(is_active = 1) as active,
        SUM(is_active = 0) as inactive,
        SUM(is_featured = 1) as featured,
        SUM(event_date >= CURDATE()) as upcoming,
        SUM(event_date < CURDATE()) as past
      FROM events
    `);
    return rows[0];
  }

  static async getRecent(limit = 5) {
    const [rows] = await pool.query(
      'SELECT * FROM events ORDER BY created_at DESC LIMIT ?',
      [limit]
    );
    return rows;
  }
}

module.exports = Event;
