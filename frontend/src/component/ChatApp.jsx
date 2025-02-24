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
  const receiverId = 3; // Admin ID is fixed as 3

  // Fetch chat history when the component mounts or chat type changes
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

  // Listen for incoming messages
  useEffect(() => {
    socket.on("receive-message", (newMessage) => {
      if (
        newMessage.receiver_id === userId ||
        newMessage.receiver_id === null // Group message
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

  // Send Message
  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessage = isGroupChat
      ? { sender_id: userId, message: input }
      : { message: input, sender_id: userId, receiver_id: receiverId };

    if (isGroupChat) {
      socket.emit("send-group-message", newMessage);
    } else {
      socket.emit("send-message", newMessage);
    }

    setInput("");
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.headerContainer}>
        <Link to="/" className="btn btn-outline-primary">
          Back to Home
        </Link>
        <h1 className={styles.chatHeader}>
          <MessageCircle /> {isGroupChat ? "Group Chat" : "Chat with Teacher"}
        </h1>
      </div>

      <div className={styles.chatWindow}>
        <div className={styles.messageList}>
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`${styles.message} ${
                msg.sender_id === userId ? styles.userMessage : styles.message
              }`}
            >
              {isGroupChat && msg.sender_id !== userId && (
                <span className={styles.senderName}>{msg.sender_name}: </span>
              )}
              {msg.message}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.inputContainer}>
        <button
          className="btn btn-secondary"
          onClick={() => setIsGroupChat(!isGroupChat)}
        >
          <Users className="w-5 h-5" />{" "}
          {isGroupChat ? "Private Chat" : "Group Chat"}
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            isGroupChat ? "Message the group..." : "Type a message..."
          }
          className={styles.inputField}
        />
        <button onClick={sendMessage} className={styles.sendButton}>
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
