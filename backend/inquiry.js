const express = require("express");
const router = express.Router();
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const app = express();
const socketPort = 5001; // Use a fixed port for the Socket server
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Adjust to your React app's URL
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("canvas-data", (data) => {
    socket.broadcast.emit("canvas-data", data); // Broadcast to all other clients
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

// Use the fixed socketPort instead of process.env.PORT
server.listen(socketPort, () =>
  console.log(`Socket server running on port ${socketPort}`)
);

module.exports = router;
