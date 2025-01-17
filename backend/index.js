require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const db = require("./connection"); // Import the database connection
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { scheduleBirthdayEmails,checkBirthdays } = require('./Birthday');
const { sendAdmissionConfirmationEmail, sendAdmissionDetailsToAdmin } = require("./Sendemail"); // Import the email service module


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
app.post("/api/courses", (req, res) => {
  const { courseName, duration, languages } = req.body;

  if (!courseName || !duration || !languages) {
    return res.status(400).send("All fields are required.");
  }

  const query = "INSERT INTO course (courseName, duration, languages) VALUES (?, ?, ?)";
  db.query(query, [courseName, duration, languages], (err, result) => {
    if (err) {
      console.error("Error adding course:", err);
      res.status(500).send("Failed to add course.");
    } else {
      const newCourse = { id: result.insertId, courseName, duration, languages };
      res.status(201).json(newCourse);
    }
  });
});


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
app.get("/api/courses", (req, res) => {
  const query = "SELECT * FROM course";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching courses:", err);
      return res.status(500).send("Failed to fetch courses");
    } else {
      return res.json(results);
    }
  });
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
      // Send email to the user using the email service module
    sendAdmissionConfirmationEmail(name, email, courseName, randomPassword)
    .then(() => {
      console.log("Email sent successfully to user.");
    })
    .catch((error) => {
      console.error("Error sending email to user:", error);
    });
      // Send admission details to the admin
  sendAdmissionDetailsToAdmin({
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
    password: randomPassword,
  })


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
