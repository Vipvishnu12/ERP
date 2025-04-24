
// db.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',     // or your DB host
  user: 'root',          // your MySQL username
  password: '12345',          // your MySQL password
  database: 'smartnri2',   // your DB name
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
