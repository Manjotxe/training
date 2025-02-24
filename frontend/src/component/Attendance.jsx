import React, { useEffect, useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import * as blazeface from "@tensorflow-models/blazeface";

const FaceRecognitionAttendance = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [status, setStatus] = useState("Waiting for face detection...");
  const [detectedNames, setDetectedNames] = useState([]);
  const [lastCapturedTime, setLastCapturedTime] = useState(0);
  const captureCooldown = 5000;
  const [welcomeMessage, setWelcomeMessage] = useState("Face Recognition Attendance");
  const [showThankYou, setShowThankYou] = useState(false);
  let isRequestInProgress = false;

  useEffect(() => {
    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
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
            prediction.bottomRight[1] - prediction.topLeft[1]
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
          "X-CSRFToken": getCSRFToken()
        }
      });
      const data = await response.json();
      if (data.success) {
        setDetectedNames(data.names);
        setStatus(`✅ Recognized: ${data.names.join(", ")}`);
        setWelcomeMessage(`Welcome ${data.names.join(", ")}, Your Attendance has been recorded.`);
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

  return (
    <div style={{ textAlign: "center", padding: "20px", backgroundColor: "#f4f4f4" }}>
      <h1>{welcomeMessage}</h1>
      {showThankYou && <p style={{ fontSize: "20px", color: "green" }}>Thank you! Have a nice day.</p>}
      <div style={{ position: "relative", display: "inline-block" }}>
        <video ref={videoRef} autoPlay style={{ border: "2px solid #333", borderRadius: "10px", marginTop: "10px" }}></video>
        <canvas ref={canvasRef} style={{ position: "absolute", top: 0, left: 0 }}></canvas>
      </div>
      <p style={{ fontSize: "18px", fontWeight: "bold" }}>{status}</p>
    </div>
  );
};

export default FaceRecognitionAttendance;
