require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const pool = require("./Connection");
const jwt = require("jsonwebtoken");
const { scheduleBirthdayEmails, checkBirthdays } = require("./Birthday");
const {
  sendAdmissionConfirmationEmail,
  sendAdmissionDetailsToAdmin,
} = require("./Sendemail"); // Import the email service module

// Middleware setup
app.use(bodyParser.json({ limit: "100mb" }));
app.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));
app.use(
  cors({
    origin: "http://localhost:5173", // Allow only your frontend
    methods: "GET,POST,PUT",
    credentials: true, // Allow credentials (cookies, authorization headers)
  })
);

// Route to handle login
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  pool.query(
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

      // Compare the provided password with the password stored in the database
      if (password !== user.password) {
        return res.status(401).json({ message: "Invalid password" });
      }

      return res.status(200).json({
        success: true,
        message: "Login successful",
        user: { id: user.id, email: user.email, role: user.role },
      });
    }
  );
});
app.post("/api/courses", (req, res) => {
  const { courseName, duration, languages } = req.body;

  if (!courseName || !duration || !languages) {
    return res.status(400).send("All fields are required.");
  }

  const query =
    "INSERT INTO course (courseName, duration, languages) VALUES (?, ?, ?)";
  pool.query(query, [courseName, duration, languages], (err, result) => {
    if (err) {
      console.error("Error adding course:", err);
      res.status(500).send("Failed to add course.");
    } else {
      const newCourse = {
        id: result.insertId,
        courseName,
        duration,
        languages,
      };
      res.status(201).json(newCourse);
    }
  });
});
app.get("/api/courses", (req, res) => {
  const query = "SELECT course_id, courseName, duration, languages FROM course";

  pool.execute(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
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
  const getCourseIdQuery = `SELECT course_id FROM course WHERE courseName = ?`;

  pool.query(getCourseIdQuery, [courseName], (err, result) => {
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

    pool.query(query, values, (err, result) => {
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
      });

      res.status(201).json({
        message: "Admission Successful",
        password: randomPassword, // Return the generated password for reference if needed
      });
    });
  });
});
//for display the users
app.get("/users", (req, res) => {
  const search = req.query.search || ""; // Default to an empty string if search is not provided
  const page = parseInt(req.query.page) || 1; // Get current page, default to 1
  const perPage = parseInt(req.query.perPage) || 5; // Get items per page, default to 5
  const yearFilter = req.query.year; // Get year filter from query params

  const offset = (page - 1) * perPage; // Calculate the offset for pagination

  // Start the SQL query
  let query = `
    SELECT * FROM admission_form
    WHERE name LIKE ? 
  `;

  // If there's a year filter, add it to the query
  if (yearFilter) {
    query += ` AND YEAR(admissionDate) = ?`;
  }

  // Add sorting and pagination
  query += `
    ORDER BY admissionDate DESC
    LIMIT ? OFFSET ?
  `;

  const queryParams = [`%${search}%`];
  if (yearFilter) queryParams.push(yearFilter); // Add year filter if provided
  queryParams.push(perPage, offset); // Add pagination params

  pool.query(query, queryParams, (err, results) => {
    if (err) {
      console.error("Error fetching users:", err);
      return res.status(500).send("Error fetching users");
    }

    // Get total number of results for pagination
    const countQuery = `
      SELECT COUNT(*) AS total FROM admission_form WHERE name LIKE ? 
      ${yearFilter ? "AND YEAR(admissionDate) = ?" : ""}
    `;
    const countQueryParams = [`%${search}%`];
    if (yearFilter) countQueryParams.push(yearFilter); // Add year filter to count query if provided

    pool.query(countQuery, countQueryParams, (countErr, countResults) => {
      if (countErr) {
        console.error("Error counting users:", countErr);
        return res.status(500).send("Error counting users");
      }
      const totalUsers = countResults[0].total;
      const totalPages = Math.ceil(totalUsers / perPage);

      res.json({
        users: results,
        totalPages: totalPages,
      });
    });
  });
});

app.get("/api/student/:id", (req, res) => {
  const studentId = req.params.id;

  const query = `
    SELECT 
      af.id AS student_id,
      af.name AS student_name,
      af.dob,
      af.fatherName,
      af.email,
      af.phoneNumber,
      af.photo,
      c.name,
      c.duration,
      c.languages
    FROM admission_form af
    JOIN course c ON af.course_id = c.course_id
    WHERE af.id = ?;
  `;

  pool.execute(query, [studentId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "Student not found" });
    }
    res.json(results[0]);
  });
});
//changing the password
app.put("/api/student/:id/password", (req, res) => {
  const { id } = req.params; // Get the student ID from the URL
  const { oldPassword, newPassword } = req.body; // Get old and new passwords from the request body

  // Fetch the current password of the student from the database
  const queryFetchPassword = "SELECT password FROM admission_form WHERE id = ?";
  pool.execute(queryFetchPassword, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "Student not found." });
    }

    const currentPassword = results[0].password;

    // Check if the old password matches the current password
    if (currentPassword !== oldPassword) {
      return res
        .status(400)
        .json({ error: "Old password is incorrect. Please try again." });
    }

    // Update the password in the database
    const queryUpdatePassword =
      "UPDATE admission_form SET password = ? WHERE id = ?";
    pool.execute(queryUpdatePassword, [newPassword, id], (err, result) => {
      if (err) {
        return res.status(500).json({ error: "Failed to update password." });
      }
      res.json({ message: "Password changed successfully!" });
    });
  });
});

app.get("/api/courses", (req, res) => {
  const query = "SELECT course_id, name FROM course";

  pool.execute(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
      res.status(500).json({ error: "Database error", details: error.message });
    }
    res.json(results);
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
