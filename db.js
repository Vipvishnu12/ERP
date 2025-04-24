const sql = require('mssql');

const config = {
  user: 'Vishnu',
  password: '12345', // or the password you gave
  server: 'ZEBRONICS', // use localhost for local DB
  database: 'SmartNandha25',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true
  },
  port: 1433
};
const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('✅ Connected to SQL Server');
    return pool;
  })
  .catch(err => console.log('❌ DB Connection Failed:', err));

module.exports = {
  sql, poolPromise
};



