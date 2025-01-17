require("dotenv").config(); // Ensure environment variables are loaded
const mysql2 = require("mysql2");


// Create a connection to the MySQL database
const db = mysql2.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err.stack);
    return;
  }
  console.log("Connected to MySQL database.");

});

module.exports = db;
