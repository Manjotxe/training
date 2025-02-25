import { useState, useEffect } from "react";
import { MessageCircle, Send, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { io } from "socket.io-client";
import axios from "axios";
import styles from "../styles/ChatApp.module.css";

const socket = io("http://localhost:5002");

export default function ChatApp() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [userId, setUserId] = useState(null);
  const [isGroupChat, setIsGroupChat] = useState(false);
  const receiverId = 3;

  // All existing useEffect hooks and functions remain the same
  useEffect(() => {
    const storedUserId = localStorage.getItem("ID");
    if (storedUserId) {
      setUserId(parseInt(storedUserId));
      socket.emit("register-user", storedUserId);
    }

    const fetchMessages = async () => {
      try {
        const url = isGroupChat
          ? "http://localhost:5002/group-chat"
          : `http://localhost:5002/chat/${storedUserId}/${receiverId}`;

        const res = await axios.get(url);
        setMessages(res.data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [isGroupChat]);

  useEffect(() => {
    socket.on("receive-message", (newMessage) => {
      if (
        newMessage.receiver_id === userId ||
        newMessage.receiver_id === null
      ) {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
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
  }, [userId, isGroupChat]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessage = isGroupChat
      ? { sender_id: userId, message: input }
      : { message: input, sender_id: userId, receiver_id: receiverId };

    if (isGroupChat) {
      socket.emit("send-group-message", newMessage);
    } else {
      socket.emit("send-message", newMessage);
      setMessages((prev) => [...prev, newMessage]);
    }

    setInput("");
  };

  return (
    <div className="container-fluid p-0">
      <div className="row g-0 h-100vh">
        <div className="col">
          <div className={`${styles.chatContainer} d-flex flex-column h-100`}>
            {/* Chat Header */}
            <div className={`${styles.headerBox} bg-white border-bottom`}>
              <div className="d-flex align-items-center justify-content-between p-3">
                <Link to="/" className="btn btn-outline-primary btn-sm">
                  ← Back to Home
                </Link>
                <div className="d-flex align-items-center">
                  <div className={styles.headerAvatar}>
                    {isGroupChat ? (
                      <Users size={20} />
                    ) : (
                      <MessageCircle size={20} />
                    )}
                  </div>
                  <h5 className="mb-0 ms-2">
                    {isGroupChat ? "Group Chat" : "Chat with Teacher"}
                  </h5>
                </div>
                <button
                  className={`btn ${
                    isGroupChat ? "btn-primary" : "btn-outline-primary"
                  } btn-sm`}
                  onClick={() => setIsGroupChat(!isGroupChat)}
                >
                  <Users size={16} className="me-1" />
                  {isGroupChat ? "Switch to Private" : "Switch to Group"}
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className={`${styles.messagesContainer} flex-grow-1 bg-light`}>
              <div className={styles.messagesList}>
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`${styles.messageWrapper} ${
                      msg.sender_id === userId ? styles.sent : styles.received
                    }`}
                  >
                    <div
                      className={`${styles.message} ${
                        msg.sender_id === userId ? styles.userMessage : ""
                      }`}
                    >
                      {isGroupChat && msg.sender_id !== userId && (
                        <div className={styles.senderName}>
                          {msg.sender_name}
                        </div>
                      )}
                      {msg.message}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Input Area */}
            <div className={`${styles.inputContainer} bg-white border-top`}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                placeholder={
                  isGroupChat
                    ? "Message the group..."
                    : "Message your teacher..."
                }
                className="form-control"
              />
              <button
                onClick={sendMessage}
                className={`${styles.sendButton} btn btn-primary`}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
