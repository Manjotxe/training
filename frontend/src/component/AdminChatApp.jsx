import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { MessageCircle, Send, Users } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";
import styles from "../styles/AdminChatApp.module.css";

const socket = io("http://localhost:5002"); // Connect to Socket.io server

export default function AdminChat() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const adminId = 3; // Admin ID is fixed as 3

  // Fetch students from backend
  useEffect(() => {
    socket.emit("register-user", adminId);
    axios
      .get("http://localhost:5002/students")
      .then((res) => setStudents(res.data))
      .catch((err) => console.error("Error fetching students:", err));
  }, []);

  // Listen for incoming messages
  useEffect(() => {
    socket.on("receive-message", (message) => {
      if (
        message.receiver_id === null || // Show broadcast messages to everyone
        (message.sender_id === selectedStudent &&
          message.receiver_id === adminId) ||
        (message.sender_id === adminId &&
          message.receiver_id === selectedStudent)
      ) {
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => {
      socket.off("receive-message");
    };
  }, [selectedStudent]);

  // Fetch chat history when a student is selected
  useEffect(() => {
    if (!selectedStudent) return;

    axios
      .get(`http://localhost:5002/chat/${selectedStudent}/${adminId}`)
      .then((res) => setMessages(res.data))
      .catch((err) => console.error("Error fetching messages:", err));
  }, [selectedStudent]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const messageData = {
      sender_id: adminId,
      receiver_id: selectedStudent === 0 ? null : selectedStudent, // Use null for broadcast
      message: input,
    };

    setMessages((prev) => [...prev, messageData]);
    socket.emit("send-message", messageData);
    setInput("");
  };

  return (
    <div className={styles.chatContainer}>
      {/* Sidebar for student list */}
      <div className={styles.sidebar}>
        <Link to="/" className="btn btn-outline-primary">
          Back to Home
        </Link>
        <h2 className={styles.sidebarTitle}>
          <Users /> Students
        </h2>
        <button
          className={`${styles.studentButton} ${
            selectedStudent === 0 ? styles.selected : ""
          }`}
          onClick={() => {
            setSelectedStudent(0); // 0 represents broadcast mode
            setMessages([]);
          }}
        >
          Send to All
        </button>

        {students.map((student) => (
          <button
            key={student.id}
            className={`${styles.studentButton} ${
              selectedStudent === student.id ? styles.selected : ""
            }`}
            onClick={() => setSelectedStudent(student.id)}
          >
            {student.name}
          </button>
        ))}
      </div>

      {/* Chat Section */}
      <div className={styles.chatMain}>
        <h1 className={styles.chatHeader}>
          <MessageCircle />{" "}
          {selectedStudent
            ? `Message ${students.find((s) => s.id === selectedStudent)?.name}`
            : "Select a student to message"}
        </h1>
        <div className={styles.chatBox}>
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`${styles.message} ${
                msg.sender_id === adminId ? styles.userMessage : styles.message
              }`}
            >
              {msg.message}
            </div>
          ))}
        </div>
        <div className={styles.inputContainer}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              selectedStudent !== null
                ? selectedStudent === 0
                  ? "Message All Students"
                  : `Message ${
                      students.find((s) => s.id === selectedStudent)?.name || ""
                    }`
                : "Select a student to message"
            }
            className={styles.inputField}
            disabled={selectedStudent === null} // Only disable when no selection is made
          />
          <button
            onClick={sendMessage}
            className={styles.sendButton}
            disabled={selectedStudent === null} // Allow for broadcast mode
          >
            <Send className={styles.sendIcon} />
          </button>
        </div>
      </div>
    </div>
  );
}
