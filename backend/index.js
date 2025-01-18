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
const { sendBillEmail } = require('./emailTemplates/SendBill');

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
  const { email } = req.query; // Use query parameter instead of body for GET request

  if (!email) {
    return res.status(400).send("Email is required");
  }

  // Query to fetch the course name from the admission_form table
  const query = "SELECT * FROM admission_form WHERE email = ?";
  db.query(query, [email], (err, admissionResults) => {
    if (err) {
      console.error("Error fetching admission data:", err);
      return res.status(500).send("Failed to fetch admission data");
    }

    if (admissionResults.length === 0) {
      return res.status(404).send("No course found for the provided email");
    }

    const courseName = admissionResults[0].courseName;

    // Query to fetch the latest bill date from the bills table
    const billQuery = "SELECT * FROM bills WHERE email = ?";
    db.query(billQuery, [email], (err, billResults) => {
      if (err) {
        console.error("Error fetching bill data:", err);
        return res.status(500).send("Failed to fetch bill data");
      }

      if (billResults.length === 0) {
        return res.json({
          courseName,
          message: "No previous record found with this email",
        });
      }

      const date = billResults[0].date;

      // Return both courseName and date in the response
      return res.json({ courseName, date });
    });
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
      c.courseName,
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

<<<<<<< HEAD
// API to handle bill creation
app.post('/api/bill', (req, res) => {
  const { name, email, courseName, rupees, date } = req.body;

  console.log('Received Data:', req.body); // Log the request payload

  const query = 'INSERT INTO bills (name, email, courseName, rupees, date) VALUES (?, ?, ?, ?, ?)';
  db.query(query, [name, email, courseName, rupees, date], (err, result) => {
    if (err) {
      console.error('Error inserting data:', err.message);
      return res.status(500).json({ error: 'Failed to create bill', details: err.message });
    }

    console.log('Data inserted successfully:', result);

    sendBillEmail(email, rupees, date)
      .then((info) => {
        res.status(200).json({
          message: 'Bill email sent successfully',
          emailResponse: info.response,
        });
      })
      .catch((err) => {
        console.error('Error sending email:', err);
        res.status(500).json({ error: 'Failed to send email', details: err.message });
      });
  });
});


scheduleBirthdayEmails();
=======
>>>>>>> e22ca191d6c6fcb48401a8db76d0c9a154dca7e2
// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
