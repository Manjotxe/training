require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const db = require("./connection"); // Import the database connection
const jwt = require("jsonwebtoken");

// Middleware setup
app.use(bodyParser.json({ limit: "100mb" }));
app.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));
app.use(
  cors({
    origin: "http://localhost:5173", // Allow only your frontend
    methods: "GET,POST",
    credentials: true, // Allow credentials (cookies, authorization headers)
  })
);

// Route to handle login
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM admission_form WHERE email = ?",
    [email],
    (err, results) => {
      if (err) {
        console.error("Database query error:", err);
        return res.status(500).json({ message: "Internal server error" });
      }

      if (results.length === 0) {
        return res.status(401).json({ message: "User not found" });
      }

      const user = results[0];
      console.log(user); // Log user details for debugging

      // Generate a JWT token
      // const token = jwt.sign(
      //   { id: user.id, email: user.email },
      //   process.env.JWT_SECRET,
      //   {
      //     expiresIn: "1h",
      //   }
      // );

      return res.status(200).json({
        success: true,
        message: "Login successful",
        user: { id: user.id, email: user.email, role: user.role },
        //token,
      });
    }
  );
});

// Route to handle admissions
app.post("/api/admissions", (req, res) => {
  const {
    name,
    dob,
    fatherName,
    motherName,
    profession,
    nationality,
    maritalStatus,
    sex,
    address,
    city,
    pinCode,
    phoneNumber,
    email,
    schoolX,
    schoolXII,
    courseName,
    admissionDate,
    signature,
    photo,
  } = req.body;

  // Generate a 10-character random password
  const randomPassword = crypto.randomBytes(4).toString("hex").slice(0, 8);

  // First, get the course_id based on courseName
  const getCourseIdQuery = `SELECT course_id FROM course WHERE name = ?`;

  db.query(getCourseIdQuery, [courseName], (err, result) => {
    if (err) {
      console.error("Error fetching course_id:", err);
      res.status(500).json({ error: "Failed to fetch course_id" });
      return;
    }

    if (result.length === 0) {
      res.status(404).json({ error: "Course not found" });
      return;
    }

    const courseId = result[0].course_id;

    // Now, proceed with the insertion into the admission_form table
    const query = `INSERT INTO admission_form (name, dob, fatherName, motherName, profession, nationality, maritalStatus, sex, address, city, pinCode, phoneNumber, email, password, schoolX, schoolXII, course_id,courseName, admissionDate, signature, photo) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [
      name,
      dob,
      fatherName,
      motherName,
      profession,
      nationality,
      maritalStatus,
      sex,
      address,
      city,
      pinCode,
      phoneNumber,
      email,
      randomPassword, // Add generated password here
      schoolX,
      schoolXII,
      courseId, 
      courseName,
      admissionDate,
      signature,
      photo,
    ];

    db.query(query, values, (err, result) => {
      if (err) {
        console.error("Error inserting data:", err);
        res.status(500).json({ error: "Failed to save admission data" });
        return;
      }

      res.status(201).json({
        message: "Admission Successful",
        password: randomPassword, // Return the generated password for reference if needed
      });
    });
  });
});



app.get('/api/student/:id', (req, res) => {
  const studentId = req.params.id;


  const query = `
    SELECT 
      af.id AS student_id,
      af.name AS student_name,
      af.dob,
      c.name,
      c.duration,
      c.languages
    FROM admission_form af
    JOIN course c ON af.course_id = c.course_id
    WHERE af.id = ?;
  `;

  db.execute(query, [studentId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(results[0]);
  });
});
app.get('/api/courses', (req, res) => {
  const query = 'SELECT course_id, name FROM course';

  db.execute(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
