require("dotenv").config();
const { google } = require("googleapis");

const {
  getAllLectures,
  getLecturesByDate,
  addLecture,
  updateLecture,
  deleteLecture,
} = require("./lectures"); // Import the functions
const { format, eachDayOfInterval, parseISO } = require("date-fns");
const inquiryRoute = require("./inquiry");
require("./chat");
const express = require("express");
const credentials = require("./credentials.json"); // Your Google JSON File

const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const multer = require("multer");
const path = require("path");
const pool = require("./Connection");
const jwt = require("jsonwebtoken");
const moment = require("moment");
const CreateGooglesheet = require("./CreateGoogleSheet");
const axios = require("axios");
const Razorpay = require("razorpay");
const { readData, updateRemark, getSheetNames } = require("./googleSheets");
const { scheduleBirthdayEmails, checkBirthdays } = require("./Birthday");
const { sendBillEmail } = require("./emailTemplates/SendBill");
const {
  sendAdmissionConfirmationEmail,
  sendAdmissionDetailsToAdmin,
} = require("./Sendemail"); // Import the email service module

// Middleware setup
app.use(bodyParser.json({ limit: "100mb" }));
app.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: "GET,POST,PUT,DELETE",
    credentials: true, // Allow credentials (cookies, authorization headers)
  })
);
const transporter = nodemailer.createTransport({
  service: "gmail", // Using Gmail for sending emails
  auth: {
    user: process.env.ADMIN_EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});
const auth = new google.auth.GoogleAuth({
  credentials: credentials,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });
const SPREADSHEET_ID = "1eP4lRLqtbCjYEuHWDt14cZemRXA20VUNXsYHQHjMSew"; // Your Sheet ID
app.use("/googlesheets", CreateGooglesheet);
// Inquiry
app.use("/api/inquiry", inquiryRoute);

//Razorpay payment 
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID, 
  key_secret: process.env.RAZORPAY_KEY_SECRET, 
});

// API to create an order
app.post("/create-order", async (req, res) => {
  try {
    const { amount, currency, receipt } = req.body;
    
    const options = {
      amount,
      currency,
      receipt,
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
});

// API to verify payment signature (optional)
app.post("/verify-payment", (req, res) => {
  const { order_id, payment_id, signature } = req.body;

  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(order_id + "|" + payment_id)
    .digest("hex");

  if (generatedSignature === signature) {
    res.json({ success: true, message: "Payment verified successfully" });
  } else {
    res.status(400).json({ success: false, message: "Payment verification failed" });
  }
});



// Fetch Google Sheets Data
app.get("/api/data", async (req, res) => {
  try {
    const { sheetName } = req.query;
    if (!sheetName) {
      return res.status(400).json({ error: "Sheet name is required" });
    }

    const data = await readData(`'${sheetName}'!A1:G100`); // Dynamically read sheet data
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/sheets", async (req, res) => {
  try {
    const sheetNames = await getSheetNames(); // Function to fetch sheet names
    res.json(sheetNames);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Update Remark in Google Sheets
app.post("/api/update-remark", async (req, res) => {
  try {
    const { sheetName, date, remark } = req.body;
    if (!sheetName || !date || !remark) {
      return res
        .status(400)
        .json({ error: "Sheet name, date, and remark are required" });
    }

    await updateRemark(sheetName, date, remark);
    res.json({ message: "Remark updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fetch lectures for a specific date
app.get("/api/lectures", (req, res) => {
  const { date } = req.query; // Get the date from the query string

  if (date) {
    // If date is provided, fetch lectures by date
    getLecturesByDate(date, (err, lectures) => {
      if (err) {
        return res.status(500).json({ message: "Error fetching lectures" });
      }
      res.status(200).json(lectures);
    });
  } else {
    // If no date is provided, fetch all lectures
    getAllLectures((err, lectures) => {
      if (err) {
        return res.status(500).json({ message: "Error fetching lectures" });
      }
      res.status(200).json(lectures);
    });
  }
});

// Add a new lecture
app.post("/api/lectures", (req, res) => {
  const { title, start_time, end_time, status, lecture_url } = req.body;

  // Set status to "upcoming" if not provided
  const lectureStatus = status || "upcoming"; // Default to "upcoming" if status is not present

  const lectureData = {
    title,
    start_time,
    end_time,
    status: lectureStatus, // Use the default status if no status provided
    lecture_url,
  };

  addLecture(lectureData, (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Error adding lecture" });
    }
    res
      .status(201)
      .json({ message: "Lecture added successfully", id: result.insertId });
  });
});

// Update a lecture
app.put("/api/lectures/:id", (req, res) => {
  const { id } = req.params;
  const { title, start_time, end_time, status, lecture_url, group } = req.body;
  const lectureData = {
    title,
    start_time,
    end_time,
    status,
    lecture_url,
    group,
  };

  updateLecture(id, lectureData, (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Error updating lecture" });
    }
    res.status(200).json({ message: "Lecture updated successfully" });
  });
});

// Delete a lecture
app.delete("/api/lectures/:id", (req, res) => {
  const { id } = req.params;

  deleteLecture(id, (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Error deleting lecture" });
    }
    res.status(200).json({ message: "Lecture deleted successfully" });
  });
});
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
app.get("/api/courses/main", (req, res) => {
  const query = "select * from course";
  pool.query(query, (err, result) => {
    if (err) {
      console.error("error to fetch data:", err.message);
    }
    res.json(result);
  });
});
app.post("/api/courses", (req, res) => {
  const { courseName, duration, image, languages, price, description } =
    req.body;

  if (!courseName || !duration || !languages || !price || !description) {
    return res.status(400).send("All fields are required.");
  }

  const query =
    "INSERT INTO course (courseName, duration, image, languages, price, description) VALUES (?, ?, ?, ?, ?, ?)";

  pool.query(
    query,
    [courseName, duration, image, languages, price, description],
    (err, result) => {
      if (err) {
        console.error("Error adding course:", err);
        res.status(500).send("Failed to add course.");
      } else {
        const newCourse = {
          id: result.insertId,
          courseName,
          duration,
          image,
          languages,
          price,
          description,
        };
        res.status(201).json(newCourse);
      }
    }
  );
});

app.get("/api/courses", (req, res) => {
  const query =
    "SELECT course_id, courseName, duration, languages, price, description FROM course";

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
    sex, // Gender from admission_form
    address,
    city,
    pinCode,
    phoneNumber,
    email,
    schoolX,
    schoolXII,
    courseName, // Course Name instead of ID
    admissionDate,
    signature,
    photo,
  } = req.body;

  const randomPassword = crypto.randomBytes(4).toString("hex").slice(0, 8);

  const query = `INSERT INTO admission_form (name, dob, fatherName, motherName, profession, nationality, maritalStatus, sex, address, city, pinCode, phoneNumber, email, password, schoolX, schoolXII, courseName, admissionDate, signature, photo) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

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
    randomPassword,
    schoolX,
    schoolXII,
    courseName, // Storing Course Name instead of Course ID
    admissionDate,
    signature,
    photo,
  ];

  pool.query(query, values, (err, result) => {
    if (err) {
      console.error("Error inserting data:", err);
      return res.status(500).json({ error: "Failed to save admission data" });
    }

    const studentId = result.insertId;

    axios
      .get(`https://api.postalpincode.in/pincode/${pinCode}`)
      .then((response) => {
        const postOffices = response.data[0]?.PostOffice;
        if (!postOffices || postOffices.length === 0) {
          return res
            .status(400)
            .json({ error: "Invalid Pincode or No Data Found" });
        }

        // Find the post office that matches any word in the provided address
        let selectedPostOffice = postOffices.find((postOffice) =>
          address.toLowerCase().includes(postOffice.Name.toLowerCase())
        );

        // If no match found, use the first post office as a fallback
        if (!selectedPostOffice) {
          selectedPostOffice = postOffices[0];
        }

        const realAddress = selectedPostOffice.Name;
        const district = selectedPostOffice.District;
        const location = `${realAddress}, ${district}`;

        const addressQuery = `INSERT INTO student_data (student_id, location, course, gender) VALUES (?, ?, ?, ?)`;

        pool.query(
          addressQuery,
          [studentId, location, courseName, sex],
          (err) => {
            if (err) {
              console.error("Error inserting student data:", err);
              return res
                .status(500)
                .json({ error: "Failed to save student data" });
            }

            sendAdmissionConfirmationEmail(
              name,
              email,
              courseName,
              randomPassword
            );

            res.status(201).json({
              message: "Admission Successful",
              password: randomPassword,
            });
          }
        );
      })
      .catch((error) => {
        console.error("Error fetching address:", error);
        return res
          .status(500)
          .json({ error: "Failed to fetch address details" });
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
      c.courseName,
      c.duration,
      c.languages
    FROM admission_form af
    JOIN course c ON af.course_id = c.course_id
    WHERE af.id = ?;
  `;

  pool.execute(query, [studentId], (err, results) => {
    if (err) {
      console.error("Database error:", err); // Log the actual error
      return res.status(500).json({ error: "Database error" });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "Student not found" });
    }
    res.json(results[0]);
  });
});

app.get("/api/fetchdetails", (req, res) => {
  const { email } = req.query;
  console.log("Fetching details for email:", email);

  const query = "SELECT * FROM admission_form WHERE email = ?";
  pool.query(query, [email], (err, admissionResults) => {
    if (err) {
      console.error("Database error:", err);
      return res
        .status(500)
        .json({ error: "Database query failed", details: err.message });
    }

    if (admissionResults.length === 0) {
      return res.status(404).json({ error: "No data found for this email" });
    }

    const courseName = admissionResults[0].courseName;
    const billQuery = "SELECT * FROM bills WHERE email = ?";

    pool.query(billQuery, [email], (err, billResults) => {
      if (err) {
        console.error("Database error:", err);
        return res
          .status(500)
          .json({ error: "Database query failed", details: err.message });
      }

      if (billResults.length === 0) {
        return res.json({
          courseName,
          message: "No bill found for this email",
        });
      }

      const date = billResults[0].date;
      return res.json({ courseName, date });
    });
  });
});

// API to handle bill creation
app.post("/api/bill", (req, res) => {
  const { name, email, courseName, rupees, date } = req.body;

  console.log("Received Data:", req.body); // Log the request payload

  const query =
    "INSERT INTO bills (name, email, courseName, rupees, date) VALUES (?, ?, ?, ?, ?)";
  pool.query(query, [name, email, courseName, rupees, date], (err, result) => {
    if (err) {
      console.error("Error inserting data:", err.message);
      return res
        .status(500)
        .json({ error: "Failed to create bill", details: err.message });
    }

    console.log("Data inserted successfully:", result);

    sendBillEmail(email, rupees, date)
      .then((info) => {
        res.status(200).json({
          message: "Bill email sent successfully",
          emailResponse: info.response,
        });
      })
      .catch((err) => {
        console.error("Error sending email:", err);
        res
          .status(500)
          .json({ error: "Failed to send email", details: err.message });
      });
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
    }
    res.json(results);
  });
});

//for file uploading ---->

app.use(cors());
app.use(express.json());
app.use(express.static("uploads"));
// Multer setup for file upload
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique file name
  },
});

const upload = multer({ storage });

app.post("/upload", upload.single("file"), (req, res) => {
  const { message, link, students } = req.body; // Get selected students, message, and link
  let fileData = null;

  // Handle file data if provided
  if (req.file) {
    const fileType = req.file.mimetype.includes("image") ? "image" : "pdf";
    const filePath = `http://localhost:5000/${req.file.filename}`;
    fileData = {
      file_name: req.file.originalname,
      file_path: filePath,
      file_type: fileType,
    };
  }

  // Ensure students is an array if provided
  let studentIds;
  try {
    studentIds = students ? JSON.parse(students) : [];
  } catch (error) {
    console.log("Error parsing students:", error);
    return res.status(400).send("Invalid student data");
  }

  // Fetch all students if no students are selected
  const sql =
    studentIds.length > 0
      ? "SELECT * FROM admission_form WHERE id IN (?)"
      : "SELECT * FROM admission_form";
  const sqlParams = studentIds.length > 0 ? [studentIds] : [];

  pool.query(sql, sqlParams, (err, studentsResults) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).send("Error fetching students");
    }

    // Check if no students are found
    if (studentsResults.length === 0) {
      console.log("No students found.");
      return res.status(404).send("No students found");
    }

    // Send the assignment to all selected (or all) students
    studentsResults.forEach((student) => {
      if (!student.email) {
        console.warn(
          `Student ${student.name} does not have an email, skipping...`
        );
        return;
      }

      const mailOptions = {
        from: process.env.ADMIN_EMAIL, // Your email
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
        pool.query(
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
              console.error(
                `Error inserting notification for student ID ${studentId}:`,
                err
              );
            } else {
              console.log(
                `Notification inserted successfully for student ID: ${studentId}`
              );
            }
          }
        );
      });
    } else {
      // Insert a general notification (student_id = null)
      pool.query(
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
app.get("/notifications", (req, res) => {
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

  pool.query(sql, [student_id], (err, results) => {
    if (err) {
      console.error("Error fetching notifications:", err);
      return res.status(500).send("Error fetching notifications");
    }
    res.status(200).json(results);
  });
});
//Route to get the course details with course id
app.get("/coursebyid/:course_id", (req, res) => {
  const courseId = req.params.course_id;
  const sql = "SELECT * FROM course WHERE course_id = ?";

  pool.query(sql, [courseId], (err, result) => {
    if (err) {
      console.error("Error fetching course details:", err);
      return res.status(500).json({ error: "Database query failed" });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: "Course not found" });
    }
    res.json(result[0]); // Send first course object
  });
});

// API to get student count by location
app.get("/students/location", async (req, res) => {
  try {
    const query = `
          SELECT location, COUNT(*) as student_count 
          FROM student_data 
          GROUP BY location
          ORDER BY student_count DESC
      `;
    const [rows] = await pool.promise().query(query); // Use .promise() here
    res.json(rows);
  } catch (error) {
    console.error("Error fetching student locations:", error.message);
    res.status(500).json({ error: error.message }); // Send actual error message
  }
});
app.get("/students/courses", async (req, res) => {
  try {
    const query = `
      SELECT 
          course,
          COUNT(*) as total_students,
          SUM(CASE WHEN gender = 'Male' THEN 1 ELSE 0 END) as male_students,
          SUM(CASE WHEN gender = 'Female' THEN 1 ELSE 0 END) as female_students,
          SUM(CASE WHEN gender NOT IN ('Male', 'Female') THEN 1 ELSE 0 END) as other_students
      FROM student_data
      GROUP BY course
      ORDER BY total_students DESC;
    `;

    const [rows] = await pool.promise().query(query);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching student courses:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// for charts data

// Fetch Attendance Data API
app.get("/api/attendance", (req, res) => {
  const studentQuery = "SELECT id FROM admission_form";
  const attendanceQuery = "SELECT attendance_data FROM student_attendance";
  const today = new Date().toISOString().split("T")[0]; // Get current date in YYYY-MM-DD format
  const currentYear = new Date().getFullYear();
  const lastFiveYears = Array.from({ length: 5 }, (_, i) => currentYear - i); // Generate last 5 years

  // First, get the total number of students
  pool.query(studentQuery, (err, studentResults) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    const totalStudents = studentResults.length; // Total number of students

    // Next, get the attendance data
    pool.query(attendanceQuery, (err, attendanceResults) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      let monthlyAttendance = {};
      let currentYearAttendance = { present: 0, totalDays: 0 };

      attendanceResults.forEach((row) => {
        const attendanceData = JSON.parse(row.attendance_data);

        for (const [date, status] of Object.entries(attendanceData)) {
          if (date > today) continue; // Skip future dates

          const dateObj = new Date(date);
          const monthName = dateObj.toLocaleString("en-US", { month: "short" });
          const yearMonth = `${dateObj.getFullYear()}-${
            dateObj.getMonth() + 1
          }`;
          const year = dateObj.getFullYear(); // YYYY format

          // Calculate total days in the month excluding weekends (Saturday & Sunday)
          const totalDaysInMonth = Array.from({
            length: new Date(
              dateObj.getFullYear(),
              dateObj.getMonth() + 1,
              0
            ).getDate(),
          })
            .map((_, i) =>
              new Date(
                dateObj.getFullYear(),
                dateObj.getMonth(),
                i + 1
              ).getDay()
            )
            .filter((day) => day !== 0 && day !== 6).length; // Excluding Sunday (0) and Saturday (6)

          // Process Monthly Data
          if (!monthlyAttendance[yearMonth]) {
            monthlyAttendance[yearMonth] = {
              name: monthName,
              year: year,
              month: dateObj.getMonth() + 1,
              present: 0,
              totalDays: totalDaysInMonth,
            };
          }
          if (status === "Present") {
            monthlyAttendance[yearMonth].present += 1;
          }

          // Process Current Year Attendance
          if (year === currentYear) {
            currentYearAttendance.totalDays += 1;
            if (status === "Present") {
              currentYearAttendance.present += 1;
            }
          }
        }
      });

      // Format Monthly Attendance Response
      const monthlyResponse = Object.values(monthlyAttendance).map((month) => {
        const avgPresent =
          totalStudents > 0
            ? (month.present / totalStudents).toFixed(2)
            : "0.00";
        const avgAbsent =
          totalStudents > 0
            ? (
                (month.totalDays * totalStudents - month.present) /
                totalStudents
              ).toFixed(2)
            : "0.00";

        return {
          name: month.name,
          year: month.year,
          month: month.month,
          present: avgPresent,
          absent: avgAbsent,
        };
      });

      // Group monthly data by year for calculation
      const yearData = {};

      // Initialize year data structure for all five years
      lastFiveYears.forEach((year) => {
        yearData[year] = {
          present: [],
          absent: [],
        };
      });

      // Collect monthly values by year
      monthlyResponse.forEach((month) => {
        if (yearData[month.year]) {
          yearData[month.year].present.push(parseFloat(month.present));
          yearData[month.year].absent.push(parseFloat(month.absent));
        }
      });

      // Calculate yearly averages based on monthly data
      const yearlyResponse = lastFiveYears.map((year) => {
        const presentValues = yearData[year].present;
        const absentValues = yearData[year].absent;

        // Calculate average: sum of values / number of months
        const avgPresent =
          presentValues.length > 0
            ? (
                presentValues.reduce((sum, val) => sum + val, 0) /
                presentValues.length
              ).toFixed(2)
            : "0.00";

        const avgAbsent =
          absentValues.length > 0
            ? (
                absentValues.reduce((sum, val) => sum + val, 0) /
                absentValues.length
              ).toFixed(2)
            : "0.00";

        return {
          name: year.toString(),
          present: avgPresent,
          absent: avgAbsent,
        };
      });

      // Calculate Current Year Attendance Percentage
      const totalPresent = monthlyResponse
        .filter((month) => month.year === currentYear)
        .reduce((sum, month) => sum + parseFloat(month.present), 0);
      const totalAbsent = monthlyResponse
        .filter((month) => month.year === currentYear)
        .reduce((sum, month) => sum + parseFloat(month.absent), 0);

      const currentYearResponse = {
        name: currentYear.toString(),
        presentPercent:
          totalPresent + totalAbsent > 0
            ? ((totalPresent / (totalPresent + totalAbsent)) * 100).toFixed(2)
            : "0.00",
        absentPercent:
          totalPresent + totalAbsent > 0
            ? ((totalAbsent / (totalPresent + totalAbsent)) * 100).toFixed(2)
            : "0.00",
      };

      res.json({
        monthlyData: monthlyResponse,
        yearlyData: yearlyResponse,
        currentYearData: currentYearResponse,
      });
    });
  });
});

// Fetch Course Names API
app.get("/api/courses", (req, res) => {
  const query = "SELECT courseName FROM course"; // Assuming 'course_name' is the column name
  pool.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

app.get("/api/studentcourses", (req, res) => {
  const query = "SELECT id, courseName, created_at FROM admission_form"; // Assuming 'course_name' is the column name
  pool.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

app.get("/total-students", async (req, res) => {
  try {
    const [rows] = await pool
      .promise()
      .query("SELECT COUNT(*) AS total FROM admission_form");
    res.json({ totalStudents: rows[0].total });
  } catch (error) {
    console.error("Error fetching total students:", error.message); // Log the error
    res.status(500).json({ error: error.message });
  }
});
app.get("/total-courses", async (req, res) => {
  try {
    const [rows] = await pool
      .promise()
      .query("SELECT COUNT(*) AS total FROM course");
    res.json({ totalCourses: rows[0].total });
  } catch (error) {
    console.error("Error fetching total courses:", error.message); // Log the error
    res.status(500).json({ error: error.message });
  }
});

app.get("/new-admissions", async (req, res) => {
  try {
    const lastMonth = moment().subtract(1, "months").format("YYYY-MM");
    const query = `
          SELECT COUNT(*) AS newAdmissions
          FROM admission_form
          WHERE DATE_FORMAT(created_at, '%Y-%m') = ?;
      `;
    const [rows] = await pool.promise().query(query, [lastMonth]);

    res.json({ newAdmissions: rows[0].newAdmissions });
  } catch (error) {
    console.error("Error fetching new admissions:", error.message);
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/attendance", (req, res) => {
  const sql = "SELECT student_id, attendance_data FROM student_attendance";

  pool.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    const formattedData = {};
    const months = new Set();

    results.forEach((row) => {
      const attendanceData = JSON.parse(row.attendance_data);

      Object.keys(attendanceData).forEach((date) => {
        const month = date.substring(0, 7); // Extracts 'YYYY-MM'
        months.add(month);

        if (!formattedData[month]) {
          formattedData[month] = { name: month, present: 0, absent: 0 };
        }

        if (attendanceData[date].toLowerCase().trim() === "present") {
          formattedData[month].present += 1;
        } else {
          formattedData[month].absent += 1;
        }
      });
    });

    // Fill in missing dates as "Absent", skipping weekends
    months.forEach((month) => {
      const startDate = new Date(`${month}-01`);
      const endDate = new Date(
        startDate.getFullYear(),
        startDate.getMonth() + 1,
        0
      );
      const allDates = eachDayOfInterval({
        start: startDate,
        end: endDate,
      }).map((d) => format(d, "yyyy-MM-dd"));

      allDates.forEach((date) => {
        const dayOfWeek = parseISO(date).getDay(); // 0 = Sunday, 6 = Saturday

        if (dayOfWeek === 0 || dayOfWeek === 6) {
          return; // Skip Saturdays and Sundays
        }

        const monthKey = date.substring(0, 7);
        if (!results.some((row) => JSON.parse(row.attendance_data)[date])) {
          formattedData[monthKey].absent += 1; // Mark missing weekday dates as absent
        }
      });
    });

    res.json(Object.values(formattedData));
  });
});
//chart data end
//Student log table data
app
  .route("/logs")
  .get(async (req, res) => {
    const { student_id } = req.query; // Receive student_id from query params
    try {
      // Fetch student name from admission_form table
      const [students] = await pool
        .promise()
        .query("SELECT name FROM admission_form WHERE id = ?", [student_id]);
      const student = students[0];
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      const sheetName = `${student.name}`; // Use student name as sheet name
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${sheetName}!A:G`,
      });

      if (response.data.values) {
        const rows = response.data.values.slice(1).reverse();
        res.json(rows);
      } else {
        res.json({ message: "No logs found" });
      }
    } catch (error) {
      console.error("Google Sheets API Error:", error.message);
      res
        .status(500)
        .json({ message: "Failed to fetch logs", error: error.message });
    }
  })

  .post(async (req, res) => {
    const {
      student_id,
      date,
      projectName,
      taskName,
      taskDescription,
      status,
      timeTaken,
    } = req.body;
    try {
      // Fetch student name from admission_form table
      const [students] = await pool
        .promise()
        .query("SELECT name FROM admission_form WHERE id = ?", [student_id]);
      const student = students[0];
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      const sheetName = `${student.name}`; // Use student name as sheet name
      const values = [
        [date, projectName, taskName, taskDescription, status, timeTaken],
      ];

      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${sheetName}!A:G`,
        valueInputOption: "RAW",
        insertDataOption: "INSERT_ROWS",
        requestBody: { values: values },
      });

      // Fetch updated logs
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${sheetName}!A:G`,
      });

      if (response.data.values) {
        res.status(200).json(response.data.values);
      } else {
        res.json({ message: "Log added successfully, but no logs found" });
      }
    } catch (error) {
      console.error("Google Sheets API Error:", error.message);
      res
        .status(500)
        .json({ message: "Failed to add log", error: error.message });
    }
  });

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
