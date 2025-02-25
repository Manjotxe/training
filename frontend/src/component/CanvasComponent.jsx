import React, { useRef, useEffect, useState } from "react";
import io from "socket.io-client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUndo } from "@fortawesome/free-solid-svg-icons";
import { faTrashCan } from "@fortawesome/free-solid-svg-icons";
import Header from "./Header";
import axios from "axios";

const CanvasComponent = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const canvasRef = useRef(null);
  const socket = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [points, setPoints] = useState([]);
  const [drawingHistory, setDrawingHistory] = useState([]);
  const [currentLine, setCurrentLine] = useState([]);
  const [color, setColor] = useState("black");
  const [lineWidth, setLineWidth] = useState(2);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Connect to the WebSocket server
  useEffect(() => {
    socket.current = io("http://localhost:5001");
    socket.current.on("canvas-data", (data) => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const image = new Image();
      image.onload = () => ctx.drawImage(image, 0, 0);
      image.src = data;
    });

    return () => socket.current.disconnect();
  }, []);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);
  //logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setIsLoggedIn(false);
    navigate("/");
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email) {
      alert("Please fill in both name and email fields");
      return;
    }

    const canvas = canvasRef.current;
    const canvasData = canvas.toDataURL();

    try {
      await axios.post("http://localhost:5000/api/inquiry/submit", {
        name,
        email,
        canvasData,
      });

      alert("Inquiry submitted successfully!");
      // Clear form
      setName("");
      setEmail("");
      handleClearCanvas();
    } catch (error) {
      console.error("Submission error:", error);
      alert("Failed to submit inquiry. Please try again.");
    }
  };
  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    let x, y;

    if (e.touches) {
      const touch = e.touches[0];
      x = (touch.clientX - rect.left) * scaleX;
      y = (touch.clientY - rect.top) * scaleY;
    } else {
      x = (e.clientX - rect.left) * scaleX;
      y = (e.clientY - rect.top) * scaleY;
    }

    return { x, y };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    setCurrentLine([x, y]);
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const stopDrawing = (e) => {
    e.preventDefault();
    setIsDrawing(false);
    const canvas = canvasRef.current;
    socket.current.emit("canvas-data", canvas.toDataURL());
    setDrawingHistory((prevHistory) => [
      ...prevHistory,
      { line: currentLine, color, lineWidth },
    ]);
    setCurrentLine([]);
  };

  const draw = (e) => {
    e.preventDefault();
    if (!isDrawing) return;
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current.getContext("2d");

    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.strokeStyle = color;

    ctx.lineTo(x, y);
    ctx.stroke();
    setCurrentLine((prevLine) => [...prevLine, x, y]);
  };

  const handleUndo = () => {
    const newHistory = [...drawingHistory];
    const lastAction = newHistory.pop();
    setDrawingHistory(newHistory);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    newHistory.forEach((history) => {
      const { line, color, lineWidth } = history;

      ctx.beginPath();
      ctx.moveTo(line[0], line[1]);
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = color;

      for (let i = 2; i < line.length; i += 2) {
        ctx.lineTo(line[i], line[i + 1]);
      }
      ctx.stroke();
    });
  };

  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setPoints([]);
    setDrawingHistory([]);
  };

  const handleColorChange = (newColor) => {
    setColor(newColor);
  };

  const handleLineWidthChange = (newWidth) => {
    setLineWidth(newWidth);
  };

  return (
    <>
      <Header isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      <div
        className="container"
        style={{ backgroundColor: "#f7fafc", padding: "2rem" }}
      >
        <div className="wrapper" style={{ maxWidth: "80%", margin: "0 auto" }}>
          <div
            className="canvasWrapper"
            style={{
              backgroundColor: "white",
              borderRadius: "1rem",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              padding: "1.5rem",
            }}
          >
            <h1
              style={{
                textAlign: "center",
                fontSize: "2rem",
                fontWeight: "bold",
                color: "#2d3748",
                marginBottom: "2rem",
              }}
            >
              Inquiry Form
            </h1>

            {/* Name and Email Input Fields */}
            <div
              className="inputFields"
              style={{
                marginBottom: "2rem",
                display: "flex",
                gap: "1rem",
                flexDirection: "column",
              }}
            >
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  padding: "1rem",
                  borderRadius: "0.5rem",
                  border: "1px solid #e2e8f0",
                  fontSize: "1rem",
                  color: "#2d3748",
                }}
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  padding: "1rem",
                  borderRadius: "0.5rem",
                  border: "1px solid #e2e8f0",
                  fontSize: "1rem",
                  color: "#2d3748",
                }}
              />
            </div>

            {/* Canvas Title */}
            <h1
              className="heading"
              style={{
                textAlign: "center",
                fontSize: "2rem",
                fontWeight: "bold",
                color: "#2d3748",
                marginBottom: "2rem",
              }}
            >
              Canvas
            </h1>

            {/* Tools Panel */}
            <div
              className="toolsPanel"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "1rem",
                paddingLeft: "1rem",
                paddingRight: "1rem",
                marginBottom: "1.5rem",
              }}
            >
              <div
                className="toolButtons"
                style={{ display: "flex", alignItems: "center", gap: "1rem" }}
              >
                {/* Color buttons */}
                <button
                  className="colorButton"
                  style={{
                    backgroundColor: "black",
                    color: "white",
                    width: "2rem",
                    height: "2rem",
                    borderRadius: "9999px",
                    borderWidth: "2px",
                    borderColor: "#e5e7eb",
                  }}
                  onClick={() => handleColorChange("black")}
                ></button>
                <button
                  className="colorButton"
                  style={{
                    backgroundColor: "red",
                    color: "white",
                    width: "2rem",
                    height: "2rem",
                    borderRadius: "9999px",
                    borderWidth: "2px",
                    borderColor: "#e5e7eb",
                  }}
                  onClick={() => handleColorChange("red")}
                ></button>
                <button
                  className="colorButton"
                  style={{
                    backgroundColor: "blue",
                    color: "white",
                    width: "2rem",
                    height: "2rem",
                    borderRadius: "9999px",
                    borderWidth: "2px",
                    borderColor: "#e5e7eb",
                  }}
                  onClick={() => handleColorChange("blue")}
                ></button>
                <button
                  className="colorButton"
                  style={{
                    backgroundColor: "green",
                    color: "white",
                    width: "2rem",
                    height: "2rem",
                    borderRadius: "9999px",
                    borderWidth: "2px",
                    borderColor: "#e5e7eb",
                  }}
                  onClick={() => handleColorChange("green")}
                ></button>
              </div>

              {/* Line width control */}
              <div
                className="lineWidthControl"
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={lineWidth}
                  onChange={(e) => handleLineWidthChange(e.target.value)}
                  style={{ width: "100%" }}
                />
                <span className="lineWidthText" style={{ fontWeight: "500" }}>
                  {lineWidth}
                </span>
              </div>
            </div>

            {/* Canvas */}
            <div
              className="canvasContainer"
              style={{
                position: "relative",
                borderRadius: "1rem",
                overflow: "hidden",
                backgroundColor: "#f9fafb",
                borderWidth: "1px",
                borderColor: "#e5e7eb",
              }}
            >
              <canvas
                ref={canvasRef}
                width={800}
                height={400}
                className="canvas"
                style={{ width: "100%", touchAction: "none" }}
                onMouseDown={startDrawing}
                onMouseUp={stopDrawing}
                onMouseMove={draw}
                onTouchStart={startDrawing}
                onTouchEnd={stopDrawing}
                onTouchMove={draw}
              />
            </div>

            {/* Canvas control buttons */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "10px",
              }}
            >
              <button
                className="button"
                onClick={handleUndo}
                style={{
                  paddingLeft: "1rem",
                  paddingRight: "1rem",
                  paddingTop: "0.5rem",
                  paddingBottom: "0.5rem",
                  gap: "0.5rem",
                  borderRadius: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <FontAwesomeIcon icon={faUndo} />
                Undo
              </button>
              <button
                className="button"
                onClick={handleClearCanvas}
                style={{
                  paddingLeft: "1rem",
                  paddingRight: "1rem",
                  paddingTop: "0.5rem",
                  paddingBottom: "0.5rem",
                  gap: "0.5rem",
                  borderRadius: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <FontAwesomeIcon icon={faTrashCan} />
                Clear Canvas
              </button>
            </div>
          </div>
        </div>
        <button
          type="submit"
          className="submitButton"
          style={{
            backgroundColor: "#4CAF50",
            color: "white",
            padding: "1rem",
            display: "block", // Ensures it's treated as a block-level element
            margin: "1rem auto", // Centers the button horizontally and adds spacing at the top
            border: "none",
            borderRadius: "0.5rem",
            fontSize: "1rem",
            fontWeight: "bold",
            cursor: "pointer",
            width: "80%",
            transition: "background-color 0.3s ease, transform 0.2s ease",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          }}
          onClick={handleSubmit}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = "#45a049";
            e.target.style.transform = "scale(1.02)";
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = "#4CAF50";
            e.target.style.transform = "scale(1)";
          }}
        >
          Submit
        </button>
      </div>
    </>
  );
};

export default CanvasComponent;
