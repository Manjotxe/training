const mysql2 = require("mysql2");

// Create a connection pool to the MySQL database
const pool = mysql2.createPool({
  host: "srv1000.hstgr.io",
  user: "u638496691_ayorex",
  password: "Ayorex12345!@#$%",
  database: "u638496691_ayorex",
  ssl: {
    rejectUnauthorized: true, // Use SSL for secure connections
  },
  waitForConnections: true, // Makes sure that the pool waits for an available connection
  connectionLimit: 10, // Number of simultaneous connections allowed
  queueLimit: 0, // No limit to the number of queued requests
});

// Test the connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error("Error connecting to the database:", err.message, err);
  } else {
    console.log("Connected to the database successfully!");
    connection.release();
  }
});

// Export the pool
module.exports = pool;
