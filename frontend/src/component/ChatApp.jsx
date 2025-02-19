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
  const userId = 3; // Replace with actual user ID logic
  const receiverId = 12; // Replace with actual receiver ID logic

  // Fetch chat history on component mount
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5002/chat/${userId}/${receiverId}`
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
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    return () => {
      socket.off("receive-message");
    };
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessage = {
      text: input,
      senderId: userId,
      receiverId: receiverId,
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);
    socket.emit("send-message", newMessage);

    // Save message to backend
    try {
      await axios.post("http://localhost:5002/send-message", newMessage);
    } catch (error) {
      console.error("Error sending message:", error);
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
          <MessageCircle /> Real-Time Chat
        </h1>
      </div>

      <div className={styles.chatWindow}>
        <div className={styles.messageList}>
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`${styles.message} ${
                msg.senderId === userId ? styles.sent : styles.received
              }`}
            >
              {msg.text}
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
