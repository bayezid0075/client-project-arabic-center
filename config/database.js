const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
});

async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('[DB] Connected to MySQL successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('[DB] Connection failed:', error.message);
    return false;
  }
}

module.exports = { pool, testConnection };
