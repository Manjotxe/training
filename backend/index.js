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

      // Compare the provided password with the password stored in the database
      if (password !== user.password) {
        return res.status(401).json({ message: "Invalid password" });
      }

      // Generate a JWT token (optional step)
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
        // token,
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

  const query = `INSERT INTO admission_form (name, dob, fatherName, motherName, profession, nationality, maritalStatus, sex, address, city, pinCode, phoneNumber, email, password, schoolX, schoolXII, courseName, admissionDate, signature, photo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

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

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
