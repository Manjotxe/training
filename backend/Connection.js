require("dotenv").config(); // Ensure environment variables are loaded
const mysql2 = require("mysql2");

// Create a connection pool to the MySQL database
const pool = mysql2.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true, // Makes sure that the pool waits for an available connection
  connectionLimit: 10, // Number of simultaneous connections allowed
  queueLimit: 0, // No limit to the number of queued requests
});

// Export the pool
module.exports = pool;
