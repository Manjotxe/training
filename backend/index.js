require("dotenv").config();
const express = require("express");
const app = express();
const multer = require('multer');
const cors = require("cors");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const db = require("./connection"); // Import your database connection
const nodemailer = require("nodemailer");
const path = require('path');

// Middleware setup
app.use(bodyParser.json({ limit: "100mb" }));
app.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));
app.use(
  cors({
    origin: "http://localhost:5173", // Update to your front-end origin
    methods: "GET,POST",
    credentials: true,
  })
);

// Nodemailer transport setup
const transporter = nodemailer.createTransport({
  service: 'gmail', // Using Gmail for sending emails
  auth: {
    user: process.env.EMAIL_USER, // Your email from .env
    pass: process.env.EMAIL_PASS, // Your app-specific password from .env
  },
});


app.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM admission_form WHERE email = ? and password = ?",
    [email,password],
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

  // Generate a random 8-character password
  const randomPassword = crypto.randomBytes(4).toString("hex").slice(0, 8);

  const query = `
    INSERT INTO admission_form (
      name, dob, fatherName, motherName, profession, nationality, maritalStatus, sex,
      address, city, pinCode, phoneNumber, email, password, schoolX, schoolXII, courseName,
      admissionDate, signature, photo
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
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
    randomPassword, // Password generated
    schoolX,
    schoolXII,
    courseName,
    admissionDate,
    signature,
    photo,
  ];

  // Insert the admission form data into the database
  db.query(query, values, (err, result) => {
    if (err) {
      console.error("Error inserting data:", err);
      return res.status(500).json({ error: "Failed to save admission data" });
    }

    // Send a welcome email to the user after saving the data
    const mailOptions = {
      from: process.env.EMAIL_USER, // Your email
      to: email, // Recipient's email
      subject: "Welcome to Our Platform",
      text: `
        Hi ${name},
        
        Thank you for registering. Your admission is successful! Here's your temporary password: ${randomPassword}.
        
        Please log in and change your password as soon as possible.
        
        Best regards,
        Admission Team
      `,
    };

    // Send the email
    transporter.sendMail(mailOptions, (emailErr, info) => {
      if (emailErr) {
        console.error("Email sending error:", emailErr);
        return res.status(500).json({ message: "Error sending welcome email" });
      }

      console.log("Welcome email sent:", info.response);

      // Only send the admission success response after the email is sent
      return res.status(201).json({
        message: "Admission Successful! A welcome email has been sent.",
        password: randomPassword, // Return the generated password if needed
      });
    });
  });
});

//for display the users
app.get('/users', (req, res) => {
  const search = req.query.search || ''; // Default to an empty string if search is not provided
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

  db.query(query, queryParams, (err, results) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).send('Error fetching users');
    }

    // Get total number of results for pagination
    const countQuery = `
      SELECT COUNT(*) AS total FROM admission_form WHERE name LIKE ? 
      ${yearFilter ? 'AND YEAR(admissionDate) = ?' : ''}
    `;
    const countQueryParams = [`%${search}%`];
    if (yearFilter) countQueryParams.push(yearFilter); // Add year filter to count query if provided

    db.query(countQuery, countQueryParams, (countErr, countResults) => {
      if (countErr) {
        console.error('Error counting users:', countErr);
        return res.status(500).send('Error counting users');
      }
      const totalUsers = countResults[0].total;
      const totalPages = Math.ceil(totalUsers / perPage);

      res.json({
        users: results,
        totalPages: totalPages
      });
    });
  });
});

//for file uploading ---->


app.use(cors());
app.use(express.json());
app.use(express.static('uploads'));
;

// Multer setup for file upload
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique file name
    }
});

const upload = multer({ storage });

app.post('/upload', upload.single('file'), (req, res) => {
  console.log("Request body:", req.body); // Debugging the body of the request

  const { message, link, students } = req.body; // Get selected students, message, and link
  let fileData = null;

  // Handle file data if provided
  if (req.file) {
      const fileType = req.file.mimetype.includes('image') ? 'image' : 'pdf';
      const filePath = `http://localhost:5000/${req.file.filename}`;
      fileData = { file_name: req.file.originalname, file_path: filePath, file_type: fileType };
      console.log("File uploaded:", fileData); // Debugging file data
  }

  // Ensure students is an array if provided
  let studentIds;
  try {
      studentIds = students ? JSON.parse(students) : [];
      console.log("Parsed student IDs:", studentIds); // Debugging studentIds
  } catch (error) {
      console.log("Error parsing students:", error);
      return res.status(400).send('Invalid student data');
  }

  // Fetch all students if no students are selected
  const sql = studentIds.length > 0
      ? `SELECT * FROM admission_form WHERE id IN (?)`
      : `SELECT * FROM admission_form`;
  const sqlParams = studentIds.length > 0 ? [studentIds] : [];

  console.log("SQL Query:", sql); // Debugging SQL query

  db.query(sql, sqlParams, (err, studentsResults) => {
      if (err) {
          console.error("Database error:", err);
          return res.status(500).send('Error fetching students');
      }

      console.log("Fetched students from DB:", studentsResults); // Debugging database result

      // Check if no students are found
      if (studentsResults.length === 0) {
          console.log("No students found.");
          return res.status(404).send('No students found');
      }

      // Send the assignment to all selected (or all) students
      studentsResults.forEach((student) => {
          console.log("Processing student:", student); // Debugging student data

          if (!student.email) {
              console.warn(`Student ${student.name} does not have an email, skipping...`);
              return;
          }

          const mailOptions = {
              from: process.env.EMAIL_USER, // Your email
              to: student.email, // Student's email
              subject: "New Assignment",
              text: `
                Hi ${student.name},
                ${message}
                ${link}
                ${fileData?.file_path}
              `,
          };

          // Send email to each student
          transporter.sendMail(mailOptions, (emailErr, info) => {
              if (emailErr) {
                  console.error("Email sending error:", emailErr);
              } else {
                  console.log(`Assignment sent to ${student.name}:`, info.response);
              }
          });
      });

      // Insert a notification for each selected student or a general notification
      const notificationSql = `
          INSERT INTO notifications (student_id, file_name, file_path, file_type, message, link) 
          VALUES (?, ?, ?, ?, ?, ?)
      `;

      if (studentIds.length > 0) {
          // Insert notifications for specific students
          studentIds.forEach((studentId) => {
              db.query(
                  notificationSql,
                  [
                      studentId || null,
                      fileData?.file_name || null,
                      fileData?.file_path || null,
                      fileData?.file_type || null,
                      message || null,
                      link || null,
                  ],
                  (err) => {
                      if (err) {
                          console.error(`Error inserting notification for student ID ${studentId}:`, err);
                      } else {
                          console.log(`Notification inserted successfully for student ID: ${studentId}`);
                      }
                  }
              );
          });
      } else {
          // Insert a general notification (student_id = null)
          db.query(
              notificationSql,
              [
                  null,
                  fileData?.file_name || null,
                  fileData?.file_path || null,
                  fileData?.file_type || null,
                  message || null,
                  link || null,
              ],
              (err) => {
                  if (err) {
                      console.error("Error inserting general notification:", err);
                  } else {
                      console.log("General notification inserted successfully.");
                  }
              }
          );
      }

      res.status(200).json({ message: "Assignment sent successfully." });
  });
});



// Route to get notifications for a specific student
app.get('/notifications', (req, res) => {
  const { student_id } = req.query; // Get the student_id from query parameters

  if (!student_id) {
      return res.status(400).json({ message: "Student ID is required" });
  }

  const sql = `
      SELECT * 
      FROM notifications 
      WHERE student_id = ? OR student_id IS NULL
      ORDER BY created_at DESC
  `;

  db.query(sql, [student_id], (err, results) => {
      if (err) {
          console.error("Error fetching notifications:", err);
          return res.status(500).send("Error fetching notifications");
      }
      res.status(200).json(results);
  });
});



// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
