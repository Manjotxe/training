const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mysql = require("mysql2");
const cors = require("cors");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:5173", methods: ["GET", "POST"] },
});

app.use(express.json());
app.use(cors());

// MySQL Database Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("Connected to MySQL database");
  }
});

// Handle new socket connections
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("send-message", async (message) => {
    console.log("Message received:", message);
    io.emit("receive-message", message);

    // Save message to MySQL
    const { senderId, receiverId, text } = message;
    const sql =
      "INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)";
    db.query(sql, [senderId, receiverId, text], (err, result) => {
      if (err) {
        console.error("Error saving message:", err);
      } else {
        console.log("Message saved to database");
      }
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// API to fetch chat history between two users
app.get("/chat/:user1/:user2", (req, res) => {
  const { user1, user2 } = req.params;
  const sql = `
    SELECT * FROM messages 
    WHERE (sender_id = ? AND receiver_id = ?) 
    OR (sender_id = ? AND receiver_id = ?) 
    ORDER BY created_at ASC
  `;

  db.query(sql, [user1, user2, user2, user1], (err, results) => {
    if (err) {
      res.status(500).json({ error: "Failed to fetch messages" });
    } else {
      res.json(results);
    }
  });
});

// API to send message (backup for socket)
app.post("/send-message", (req, res) => {
  console.log("Incoming request body:", req.body); // Log the request data

  const { senderId, receiverId, text } = req.body;

  const sql =
    "INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)";

  db.query(sql, [senderId, receiverId, text], (err, result) => {
    if (err) {
      console.error("Error inserting message:", err);
      res.status(500).json({ error: "Failed to send message" });
    } else {
      console.log("Message inserted successfully with ID:", result.insertId);
      res.status(201).json({ id: result.insertId, senderId, receiverId, text });
    }
  });
});

const PORT = 5002;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
