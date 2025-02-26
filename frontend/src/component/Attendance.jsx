import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import * as tf from "@tensorflow/tfjs";
import * as blazeface from "@tensorflow-models/blazeface";
import "../styles/Attendance.css";

const FaceRecognitionAttendance = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [status, setStatus] = useState("Waiting for face detection...");
  const [detectedNames, setDetectedNames] = useState([]);
  const [lastCapturedTime, setLastCapturedTime] = useState(0);
  const captureCooldown = 5000;
  const [welcomeMessage, setWelcomeMessage] = useState(
    "Face Recognition Attendance"
  );
  const [showThankYou, setShowThankYou] = useState(false);
  let isRequestInProgress = false;

  useEffect(() => {
    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.error("Error accessing webcam:", err);
      }
    };
    startVideo();
    detectFaces();
  }, []);

  const detectFaces = async () => {
    const model = await blazeface.load();
    console.log("BlazeFace model loaded!");

    const detect = async () => {
      if (!videoRef.current || !canvasRef.current) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const predictions = await model.estimateFaces(video, false);

      if (predictions.length > 0) {
        predictions.forEach((prediction, index) => {
          const [x, y, width, height] = [
            prediction.topLeft[0],
            prediction.topLeft[1],
            prediction.bottomRight[0] - prediction.topLeft[0],
            prediction.bottomRight[1] - prediction.topLeft[1],
          ];

          ctx.strokeStyle = "red";
          ctx.lineWidth = 3;
          ctx.strokeRect(x, y, width, height);
          let faceLabel = detectedNames[index] || "Detecting...";
          ctx.fillStyle = "red";
          ctx.font = "16px Arial";
          ctx.fillText(faceLabel, x, y - 10);
        });

        setStatus(`✅ ${predictions.length} Face(s) detected!`);

        const now = new Date().getTime();
        if (now - lastCapturedTime > captureCooldown) {
          setLastCapturedTime(now);
          captureAndSend();
        }
      } else {
        setStatus("Waiting for face detection...");
        setDetectedNames([]);
        setWelcomeMessage("Face Recognition Attendance");
        setShowThankYou(false);
      }

      requestAnimationFrame(detect);
    };

    detect();
  };

  const captureAndSend = async () => {
    if (isRequestInProgress || !canvasRef.current || !videoRef.current) return;
    isRequestInProgress = true;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    let imageData = canvas.toDataURL("image/jpeg");

    try {
      const response = await fetch("http://localhost:8000/mark_attendance/", {
        method: "POST",
        body: JSON.stringify({ image_data: imageData }),
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCSRFToken(),
        },
      });
      const data = await response.json();
      if (data.success) {
        const studentNames = data.students.map((student) => student.name);
        setDetectedNames(studentNames);
        setStatus(`✅ Recognized: ${studentNames.join(", ")}`);
        setWelcomeMessage(
          `Welcome ${studentNames.join(
            ", "
          )}, Your Attendance has been recorded.`
        );
        setShowThankYou(true);
      } else {
        setDetectedNames(["Unknown Face"]);
        setStatus("❌ Face not recognized");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      isRequestInProgress = false;
    }
  };

  const getCSRFToken = () => {
    let cookieValue = null;
    const cookies = document.cookie.split(";");
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.startsWith("csrftoken=")) {
        cookieValue = cookie.substring("csrftoken=".length);
        break;
      }
    }
    return cookieValue;
  };

  // Function to determine status class
  const getStatusClass = () => {
    if (status.includes("✅")) return "status-text status-success";
    if (status.includes("❌")) return "status-text status-error";
    return "status-text status-waiting";
  };

  const getCurrentDate = () => {
    const date = new Date();
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="attendance-container">
      <div className="content-wrapper-attendance">
        <div className="header-section">
          <h1
            className={`attendance-title ${
              showThankYou ? "welcome-animation" : ""
            }`}
          >
            {welcomeMessage}
          </h1>
          {showThankYou && (
            <p className="attendance-thank-you">Thank you! Have a nice day.</p>
          )}
          {/* Cross icon to go back to home */}
          <Link to="/" className="close-icon">
            <X size={24} />
          </Link>
        </div>

        <div className="video-container">
          <video ref={videoRef} autoPlay className="attendance-video"></video>
          <canvas ref={canvasRef} className="attendance-canvas"></canvas>
        </div>

        <div className="status-container">
          <p className={getStatusClass()}>{status}</p>
        </div>

        <div className="app-footer">
          {getCurrentDate()} • Smart Attendance System
        </div>
      </div>
    </div>
  );
};

export default FaceRecognitionAttendance;
