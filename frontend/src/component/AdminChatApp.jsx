import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { MessageCircle, Send, Users, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";
import styles from "../styles/AdminChatApp.module.css";

const socket = io("http://localhost:5002"); // Connect to Socket.io server

export default function AdminChat() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [unreadCounts, setUnreadCounts] = useState({}); // Store unread counts
  const [isGroupChat, setIsGroupChat] = useState(false);
  const adminId = 3; // Admin ID is fixed as 3

  // Fetch students & unread messages count from backend
  useEffect(() => {
    socket.emit("register-user", adminId);

    axios
      .get("http://localhost:5002/students")
      .then((res) => setStudents(res.data))
      .catch((err) => console.error("Error fetching students:", err));

    axios
      .get(`http://localhost:5002/unread-messages/${adminId}`)
      .then((res) => {
        const counts = {};
        res.data.forEach(({ sender_id, unread_count }) => {
          counts[sender_id] = unread_count;
        });
        setUnreadCounts(counts);
      })
      .catch((err) => console.error("Error fetching unread counts:", err));
  }, []);

  // Listen for incoming messages & update unread count
  useEffect(() => {
    socket.on("receive-message", (message) => {
      if (
        message.receiver_id === null ||
        (message.sender_id === selectedStudent &&
          message.receiver_id === adminId) ||
        (message.sender_id === adminId &&
          message.receiver_id === selectedStudent)
      ) {
        setMessages((prev) => [...prev, message]);
      } else {
        // Increase unread count for sender if chat is not open
        setUnreadCounts((prev) => ({
          ...prev,
          [message.sender_id]: (prev[message.sender_id] || 0) + 1,
        }));
      }
    });

    socket.on("receive-group-message", (message) => {
      if (isGroupChat) {
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => {
      socket.off("receive-message");
      socket.off("receive-group-message");
    };
  }, [selectedStudent, isGroupChat]);

  // Fetch chat history when a student is selected & mark messages as read
  useEffect(() => {
    if (isGroupChat) {
      axios
        .get("http://localhost:5002/group-chat")
        .then((res) => setMessages(res.data))
        .catch((err) => console.error("Error fetching group messages:", err));
    } else if (selectedStudent) {
      axios
        .get(`http://localhost:5002/chat/${selectedStudent}/${adminId}`)
        .then((res) => setMessages(res.data))
        .catch((err) => console.error("Error fetching messages:", err));

      // Mark messages as read
      axios
        .post("http://localhost:5002/mark-as-read", {
          adminId,
          studentId: selectedStudent,
        })
        .then(() => {
          setUnreadCounts((prev) => ({ ...prev, [selectedStudent]: 0 }));
        })
        .catch((err) => console.error("Error marking messages as read:", err));
    }
  }, [selectedStudent, isGroupChat]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const messageData = isGroupChat
      ? { sender_id: adminId, message: input }
      : {
          sender_id: adminId,
          receiver_id: selectedStudent === 0 ? null : selectedStudent,
          message: input,
        };

    if (isGroupChat) {
      socket.emit("send-group-message", messageData);
    } else {
      socket.emit("send-message", messageData);
    }
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
            setSelectedStudent(0);
            setIsGroupChat(false);
            setMessages([]);
          }}
        >
          Send to All
        </button>

        <button
          className={`${styles.studentButton} ${
            isGroupChat ? styles.selected : ""
          }`}
          onClick={() => {
            setIsGroupChat(true);
            setSelectedStudent(null);
            setMessages([]);
          }}
        >
          <MessageSquare /> Group Chat
        </button>

        {students.map((student) => (
          <button
            key={student.id}
            className={`${styles.studentButton} ${
              selectedStudent === student.id ? styles.selected : ""
            }`}
            onClick={() => {
              setSelectedStudent(student.id);
              setIsGroupChat(false);
            }}
          >
            {student.name}{" "}
            {unreadCounts[student.id] > 0 && (
              <span className={styles.unreadBadge}>
                {unreadCounts[student.id]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Chat Section */}
      <div className={styles.chatMain}>
        <h1 className={styles.chatHeader}>
          <MessageCircle />{" "}
          {isGroupChat
            ? "Group Chat"
            : selectedStudent
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
              {isGroupChat && msg.sender_id !== adminId && (
                <span className={styles.senderName}>{msg.sender_name}: </span>
              )}
              {msg.message}
            </div>
          ))}
        </div>

        <div className={styles.inputContainer}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isGroupChat
                ? "Message the group"
                : selectedStudent !== null
                ? selectedStudent === 0
                  ? "Message All Students"
                  : `Message ${
                      students.find((s) => s.id === selectedStudent)?.name || ""
                    }`
                : "Select a student to message"
            }
            className={styles.inputField}
            disabled={selectedStudent === null && !isGroupChat}
          />
          <button
            onClick={sendMessage}
            className={styles.sendButton}
            disabled={selectedStudent === null && !isGroupChat}
          >
            <Send className={styles.sendIcon} />
          </button>
        </div>
      </div>
    </div>
  );
}
