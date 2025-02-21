import { useState, useEffect } from "react";
import { MessageCircle, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { io } from "socket.io-client";
import axios from "axios"; // Import axios for API requests
import styles from "../styles/ChatApp.module.css";

const socket = io("http://localhost:5002");

export default function ChatApp() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [userId, setUserId] = useState(null);
  const receiverId = 3; // Admin ID is fixed as 3

  // Fetch chat history on component mount
  useEffect(() => {
    const storedUserId = localStorage.getItem("ID");
    if (storedUserId) {
      setUserId(parseInt(storedUserId));
      socket.emit("register-user", storedUserId); // Send user ID to backend
    }

    const fetchMessages = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5002/chat/${storedUserId}/${receiverId}`
        );
        setMessages(res.data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };
    fetchMessages();
  }, []);

  useEffect(() => {
    socket.on("receive-message", (newMessage) => {
      if (
        newMessage.receiver_id === userId ||
        newMessage.receiver_id === null
      ) {
        // Only update if message is meant for this user
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      }
    });

    return () => {
      socket.off("receive-message");
    };
  }, [userId]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessage = {
      message: input,
      sender_id: userId,
      receiver_id: receiverId,
    };
    setMessages((prev) => [...prev, newMessage]);
    socket.emit("send-message", newMessage);

    setInput("");
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.headerContainer}>
        <Link to="/" className="btn btn-outline-primary">
          Back to Home
        </Link>
        <h1 className={styles.chatHeader}>
          <MessageCircle /> Chat with Teacher
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
              {msg.message}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.inputContainer}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className={styles.inputField}
        />
        <button onClick={sendMessage} className={styles.sendButton}>
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
