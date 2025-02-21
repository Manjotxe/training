const express = require("express");
const mysql = require("mysql2/promise");
const router = express.Router();
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();
const { sendInquiryConfirmationEmail } = require("./Sendemail");

// Create MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10, // Max connections
  queueLimit: 0,
});

// Inquiry submission endpoint
router.post("/submit", async (req, res) => {
  try {
    const { name, email, canvasData } = req.body;

    if (!name || !email || !canvasData) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Insert into the database
    const [result] = await pool.query(
      "INSERT INTO inquiry (name, email, canvas_data) VALUES (?, ?, ?)",
      [name, email, canvasData]
    );

    // Send email confirmation
    await sendInquiryConfirmationEmail(name, email, canvasData);

    res.status(200).json({
      message: "Inquiry saved successfully and email sent",
      insertId: result.insertId,
    });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Database error" });
  }
});

// Set up a separate HTTP server for Socket.io
const app = express();
app.use(express.json()); // Middleware to parse JSON body

const socketPort = 5001;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("canvas-data", (data) => {
    socket.broadcast.emit("canvas-data", data);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

server.listen(socketPort, () => {
  console.log(`Socket server running on port ${socketPort}`);
});

// Export only the router for API routes
module.exports = router;
