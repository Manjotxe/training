import { useState, useEffect, useRef } from "react";
import { MessageCircle, Send, Users, Mic } from "lucide-react";
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
  const [isListening, setIsListening] = useState(false);
  const [language, setLanguage] = useState("en-US"); // Default language
  const recognitionRef = useRef(null);
  const receiverId = 3;

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

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    };
  }, [isGroupChat]);

  useEffect(() => {
    socket.on("receive-message", (newMessage) => {
      if (
        (newMessage.receiver_id === userId && !isGroupChat) ||
        (newMessage.receiver_id === null && !isGroupChat)
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

  const toggleListening = () => {
    if (
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      setIsListening(false);
    } else {
      setIsListening(true);
      recognitionRef.current = new (window.SpeechRecognition ||
        window.webkitSpeechRecognition)();

      const recognition = recognitionRef.current;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = language;

      recognition.onresult = (event) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript;
          }
        }

        setInput((prev) => prev + " " + transcript.trim());
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    }
  };

  useEffect(() => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isGroupChat]);

  return (
    <div className="container-fluid p-0">
      <div className="row g-0 h-100vh">
        <div className="col">
          <div className={`${styles.chatContainer} d-flex flex-column h-100`}>
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

            <div className={`${styles.inputContainer} bg-white border-top`}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  width: "100%",
                }}
              >
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="form-select"
                  style={{ maxWidth: "150px" }}
                >
                  <option value="en-US">English</option>
                  <option value="es-ES">Spanish</option>
                  <option value="fr-FR">French</option>
                  <option value="de-DE">German</option>
                  <option value="hi-IN">Hindi</option>
                  <option value="zh-CN">Chinese</option>
                </select>

                <div style={{ position: "relative", width: "100%" }}>
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
                    style={{ paddingRight: "40px" }}
                  />
                  <button
                    onClick={toggleListening}
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: isListening ? "red" : "#555",
                      zIndex: 2,
                    }}
                    title={isListening ? "Stop listening" : "Start voice input"}
                  >
                    <Mic size={18} />
                  </button>
                </div>
              </div>
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
