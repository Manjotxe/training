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

    const sql =
      "INSERT INTO messages (sender_id, receiver_id, message, is_read) VALUES (?, ?, ?, ?)";
    db.query(sql, [sender_id, receiver_id, msgText, false], (err) => {
      if (err) {
        console.error("Error saving message:", err);
        return;
      }

      // Send message to specific user if online
        io.to(receiverSocketId).emit("receive-message", message);
    });
  });

  // Handle sending group messages
  socket.on("send-group-message", (message) => {
    console.log("Group message received:", message);

    const { sender_id, message: msgText } = message;

    const sql = "INSERT INTO group_chat (sender_id, message) VALUES (?, ?)";
    db.query(sql, [sender_id, msgText], (err) => {
      if (err) {
        console.error("Error saving group message:", err);
        return;
      }

      // Broadcast message to all connected users
      io.emit("receive-group-message", message);
    });
  });

  // When user disconnects, remove them from online users
  socket.on("disconnect", () => {
    Object.keys(onlineUsers).forEach((key) => {
      if (onlineUsers[key] === socket.id) {
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
    OR receiver_id IS NULL 
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
app.get("/unread-messages/:adminId", (req, res) => {
  const { adminId } = req.params;
  const sql = `
    SELECT sender_id, COUNT(*) AS unread_count
    FROM messages
    WHERE receiver_id = ? AND is_read = FALSE
    GROUP BY sender_id
  `;

  db.query(sql, [adminId], (err, results) => {
    if (err) {
      res.status(500).json({ error: "Failed to fetch unread messages" });
    } else {
      res.json(results);
    }
  });
});

app.post("/mark-as-read", (req, res) => {
  const { adminId, studentId } = req.body;

  const sql = `
    UPDATE messages
    SET is_read = TRUE
    WHERE sender_id = ? AND receiver_id = ?
  `;

  db.query(sql, [studentId, adminId], (err, result) => {
    if (err) {
      res.status(500).json({ error: "Failed to mark messages as read" });
    } else {
      res.json({ success: true });
    }
  });
});

// API to fetch students sorted by latest message timestamp
app.get("/students", (req, res) => {
  const sql = `
    SELECT a.id, a.name, 
      (SELECT MAX(created_at) FROM messages WHERE sender_id = a.id OR receiver_id = a.id) AS last_message_time
    FROM admission_form a
    WHERE role = 'user'
    ORDER BY last_message_time IS NULL, last_message_time DESC;

  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching students:", err);
      res.status(500).json({ error: "Failed to fetch students" });
    } else {
      res.json(results);
    }
  });
});
// API to fetch group chat messages
app.get("/group-chat", (req, res) => {
  const sql = `SELECT gc.*, a.name AS sender_name
               FROM group_chat gc 
               JOIN admission_form a ON gc.sender_id = a.id 
               ORDER BY gc.created_at ASC`;

  db.query(sql, (err, results) => {
    if (err) {
      res.status(500).json({ error: "Failed to fetch group chat messages" });
    } else {
      res.json(results);
    }
  });
});

const PORT = 5002;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
