const mysql = require("mysql2");
require("dotenv").config();

// Create the database connection using environment variables
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Connect to the MySQL database
db.connect((err) => {
  if (err) {
    console.error("error connecting to the database: ", err);
    return;
  }
  console.log("Connected to the database");
});

// Fetch lectures for a specific date
const getLecturesByDate = (date, callback) => {
  const query = `
        SELECT * FROM lectures
        WHERE DATE(start_time) = ? 
        ORDER BY start_time ASC;
    `;

  db.query(query, [date], (err, results) => {
    if (err) {
      console.error("Error fetching lectures:", err);
      callback(err, null);
      return;
    }
    callback(null, results);
  });
};

// Add a new lecture
const addLecture = (lectureData, callback) => {
  const query = `
        INSERT INTO lectures (title, start_time, end_time, status, lecturer_name, \`group\`)
        VALUES (?, ?, ?, ?, ?, ?);
    `;

  db.query(
    query,
    [
      lectureData.title,
      lectureData.start_time,
      lectureData.end_time,
      lectureData.status,
      lectureData.lecturer_name,
      lectureData.group,
    ],
    (err, results) => {
      if (err) {
        console.error("Error adding lecture:", err);
        callback(err, null);
        return;
      }
      callback(null, results);
    }
  );
};

// Update a lecture
const updateLecture = (id, lectureData, callback) => {
  const query = `
        UPDATE lectures
        SET title = ?, start_time = ?, end_time = ?, status = ?, lecturer_name = ?, \`group\` = ?
        WHERE id = ?;
    `;

  db.query(
    query,
    [
      lectureData.title,
      lectureData.start_time,
      lectureData.end_time,
      lectureData.status,
      lectureData.lecturer_name,
      lectureData.group,
      id,
    ],
    (err, results) => {
      if (err) {
        console.error("Error updating lecture:", err);
        callback(err, null);
        return;
      }
      callback(null, results);
    }
  );
};

// Delete a lecture
const deleteLecture = (id, callback) => {
  const query = `
        DELETE FROM lectures WHERE id = ?;
    `;

  db.query(query, [id], (err, results) => {
    if (err) {
      console.error("Error deleting lecture:", err);
      callback(err, null);
      return;
    }
    callback(null, results);
  });
};

// Export functions
module.exports = {
  getLecturesByDate,
  addLecture,
  updateLecture,
  deleteLecture,
};
