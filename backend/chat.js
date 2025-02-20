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

// Store connected users
const onlineUsers = {};

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // When a user logs in, store their socket ID
  socket.on("register-user", (userId) => {
    onlineUsers[userId] = socket.id;
    console.log(`User ${userId} is online with socket ID: ${socket.id}`);
  });

  // Handle sending messages
  socket.on("send-message", (message) => {
    console.log("Message received:", message);

    const { sender_id, receiver_id, message: msgText } = message;

    // Save message to MySQL
    const sql =
      "INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)";
    db.query(sql, [sender_id, receiver_id, msgText], (err, result) => {
      if (err) {
        console.error("Error saving message:", err);
        return;
      }
      console.log("Message saved to database");

      // Check if receiver is online
      const receiverSocketId = onlineUsers[receiver_id];

      if (receiverSocketId) {
        // Send message to the specific user only if they are online
        io.to(receiverSocketId).emit("receive-message", message);
        console.log(`Message sent to online user: ${receiver_id}`);
      }
    });
  });

  // When user disconnects, remove them from online users
  socket.on("disconnect", () => {
    Object.keys(onlineUsers).forEach((key) => {
      if (onlineUsers[key] === socket.id) {
        console.log(`User ${key} disconnected`);
        delete onlineUsers[key];
      }
    });
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

// API to fetch students (users) from admission_form table
app.get("/students", (req, res) => {
  const sql = "SELECT id, name FROM admission_form WHERE role = 'user'";

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching students:", err);
      res.status(500).json({ error: "Failed to fetch students" });
    } else {
      res.json(results);
    }
  });
});

const PORT = 5002;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
