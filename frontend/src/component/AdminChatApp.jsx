import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import {
  MessageCircle,
  Send,
  Users,
  MessageSquare,
  Search,
} from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";
import styles from "../styles/AdminChatApp.module.css";

// Move socket connection outside component to prevent recreation
const socket = io("http://localhost:5002");

export default function AdminChat() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [unreadCounts, setUnreadCounts] = useState({});
  const [isGroupChat, setIsGroupChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const adminId = 3;

  // Use refs to access latest state in socket callbacks
  const selectedStudentRef = useRef(selectedStudent);
  const isGroupChatRef = useRef(isGroupChat);
  const messagesRef = useRef(messages);

  // Update refs when state changes
  useEffect(() => {
    selectedStudentRef.current = selectedStudent;
    isGroupChatRef.current = isGroupChat;
    messagesRef.current = messages;
  }, [selectedStudent, isGroupChat, messages]);

  // Initial setup - fetch students and register socket
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

    // Socket listeners
    const handleReceiveMessage = (message) => {
      console.log("Received message:", message);
      if (
        message.receiver_id === null ||
        (message.sender_id === selectedStudentRef.current &&
          message.receiver_id === adminId) ||
        (message.sender_id === adminId &&
          message.receiver_id === selectedStudentRef.current)
      ) {
        setMessages((prev) => [...prev, message]);
      } else {
        setUnreadCounts((prev) => ({
          ...prev,
          [message.sender_id]: (prev[message.sender_id] || 0) + 1,
        }));
      }
    };

    const handleGroupMessage = (message) => {
      console.log("Received group message:", message);
      if (isGroupChatRef.current) {
        setMessages((prev) => [...prev, message]);
      }
    };

    // Set up socket listeners
    socket.on("receive-message", handleReceiveMessage);
    socket.on("receive-group-message", handleGroupMessage);

    // Cleanup socket listeners
    return () => {
      socket.off("receive-message", handleReceiveMessage);
      socket.off("receive-group-message", handleGroupMessage);
    };
  }, []); // Empty dependency array - only run once

  // Fetch chat history when switching conversations
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

    // Add message to UI immediately
    const optimisticMessage = {
      ...messageData,
      sender_name: "Admin", // Add any other necessary fields
    };

    if (isGroupChat) {
      socket.emit("send-group-message", messageData);
    } else {
      socket.emit("send-message", messageData);
      setMessages((prev) => [...prev, messageData]);
    }
    setInput("");
  };

  return (
    <div className={`${styles.chatContainer} container-fluid p-0`}>
      {/* Sidebar */}
      <div className={`${styles.sidebar} bg-white`}>
        <div className="p-3 border-bottom">
          <Link to="/" className="btn btn-outline-primary btn-sm mb-3 w-100">
            ← Back to Home
          </Link>
          <div className={`${styles.searchWrapper} position-relative`}>
            <Search className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search students..."
              className="form-control form-control-sm pl-4"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className={`${styles.sidebarContent} p-3`}>
          <button
            className={`${styles.studentButton} ${
              selectedStudent === 0 ? styles.selected : ""
            } w-100 mb-2`}
            onClick={() => {
              setSelectedStudent(0);
              setIsGroupChat(false);
              setMessages([]);
            }}
          >
            <Users className="me-2" />
            Send to All
          </button>

          <button
            className={`${styles.studentButton} ${
              isGroupChat ? styles.selected : ""
            } w-100 mb-2`}
            onClick={() => {
              setIsGroupChat(true);
              setSelectedStudent(null);
            }}
          >
            <MessageSquare className="me-2" />
            Group Chat
          </button>

          <h6 className="text-uppercase text-muted small fw-bold mt-4 mb-3">
            Students
          </h6>

          {students
            .filter((student) =>
              student.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((student) => (
              <button
                key={student.id}
                className={`${styles.studentButton} ${
                  selectedStudent === student.id ? styles.selected : ""
                } w-100 mb-2`}
                onClick={() => {
                  setSelectedStudent(student.id);
                  setIsGroupChat(false);
                }}
              >
                <div className={styles.studentInfo}>
                  <div className={styles.avatarCircle}>
                    {student.name.charAt(0)}
                  </div>
                  <span>{student.name}</span>
                </div>
                {unreadCounts[student.id] > 0 && (
                  <span className={`${styles.unreadBadge} badge bg-danger`}>
                    {unreadCounts[student.id]}
                  </span>
                )}
              </button>
            ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className={styles.chatMain}>
        {/* Chat Header */}
        <div className={`${styles.chatHeader} border-bottom bg-white`}>
          {isGroupChat || selectedStudent ? (
            <div className="d-flex align-items-center">
              <div className={styles.headerAvatar}>
                {isGroupChat ? (
                  <MessageSquare />
                ) : (
                  students.find((s) => s.id === selectedStudent)?.name.charAt(0)
                )}
              </div>
              <div>
                <h5 className="mb-0">
                  {isGroupChat
                    ? "Group Chat"
                    : selectedStudent === 0
                    ? "All Students"
                    : students.find((s) => s.id === selectedStudent)?.name}
                </h5>
                <small className="text-muted">
                  {isGroupChat
                    ? `${students.length} participants`
                    : selectedStudent === 0
                    ? `${students.length} students`
                    : "Direct Message"}
                </small>
              </div>
            </div>
          ) : (
            <h5 className="text-muted mb-0">
              Select a conversation to start messaging
            </h5>
          )}
        </div>

        {/* Messages Area */}
        <div className={styles.messagesContainer}>
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`${styles.messageWrapper} ${
                msg.sender_id === adminId ? styles.sent : styles.received
              }`}
            >
              <div
                className={`${styles.message} ${
                  msg.sender_id === adminId ? styles.userMessage : ""
                }`}
              >
                {isGroupChat && msg.sender_id !== adminId && (
                  <div className={styles.senderName}>{msg.sender_name}</div>
                )}
                {msg.message}
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className={`${styles.inputContainer} bg-white border-top`}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
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
            className="form-control"
            disabled={selectedStudent === null && !isGroupChat}
          />
          <button
            onClick={sendMessage}
            className={`${styles.sendButton} btn btn-primary`}
            disabled={selectedStudent === null && !isGroupChat}
          >
            <Send className={styles.sendIcon} />
          </button>
        </div>
      </div>
    </div>
  );
}
