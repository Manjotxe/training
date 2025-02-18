require("dotenv").config(); // Ensure environment variables are loaded
const mysql2 = require("mysql2");

<<<<<<< HEAD

// Create a connection to the MySQL database
const db = mysql2.createConnection({
=======
// Create a connection pool to the MySQL database
const pool = mysql2.createPool({
>>>>>>> e3aa18398a4297d46afb1a985017045bb40030d0
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true, // Makes sure that the pool waits for an available connection
  connectionLimit: 10, // Number of simultaneous connections allowed
  queueLimit: 0, // No limit to the number of queued requests
});

// Test the connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error("Error connecting to the database:", err.message);
  } else {
    console.log("Connected to the database successfully!");
    connection.release(); // Release the connection back to the pool
  }
<<<<<<< HEAD
  console.log("Connected to MySQL database.");

=======
>>>>>>> e3aa18398a4297d46afb1a985017045bb40030d0
});

// Export the pool
module.exports = pool;
