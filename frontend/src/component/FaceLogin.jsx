import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as tf from "@tensorflow/tfjs";
import * as blazeface from "@tensorflow-models/blazeface";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

const FaceLogin = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();
  const [status, setStatus] = useState("Waiting for face detection...");
  const [userName, setUserName] = useState("");
  const [lastCapturedTime, setLastCapturedTime] = useState(0);
  const captureCooldown = 5000;
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
        predictions.forEach((prediction) => {
          const [x, y, width, height] = [
            prediction.topLeft[0],
            prediction.topLeft[1],
            prediction.bottomRight[0] - prediction.topLeft[0],
            prediction.bottomRight[1] - prediction.topLeft[1],
          ];

          ctx.strokeStyle = "red";
          ctx.lineWidth = 3;
          ctx.strokeRect(x, y, width, height);
          ctx.fillStyle = "red";
          ctx.font = "16px Arial";
          ctx.fillText(userName || "Detecting...", x, y - 10);
        });

        setStatus(`✅ ${predictions.length} Face(s) detected!`);

        const now = new Date().getTime();
        if (now - lastCapturedTime > captureCooldown) {
          setLastCapturedTime(now);
          captureAndSend();
        }
      } else {
        setStatus("Waiting for face detection...");
        setUserName("");
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
      const response = await fetch("http://localhost:8000/login_face/", {
        method: "POST",
        body: JSON.stringify({ image_data: imageData }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();
      console.log(data);
      if (data.success) {
        const { id, email, role } = data.user;

        localStorage.setItem("token", data.success);
        localStorage.setItem("ID", id);
        localStorage.setItem("email", email);
        localStorage.setItem("role", role);

        setUserName(email.split("@")[0]);
        setStatus(`✅ Logged in as: ${email}`);
        
        setTimeout(() => navigate("/"), 2000);
      } else {
        setUserName("Unknown Face");
        setStatus("❌ Face not recognized");
      }
    } catch (error) {
      console.error("Error:", error);
      setStatus("❌ Server error, please try again");
    } finally {
      isRequestInProgress = false;
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px", backgroundColor: "#f4f4f4" }}>
      <button
        onClick={() => navigate("/login")}
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          background: "none",
          border: "none",
          fontSize: "24px",
          cursor: "pointer",
          color: "#333",
        }}
      >
        <FontAwesomeIcon icon={faArrowLeft} />
      </button>
      <h1>Face Login System</h1>
      <p style={{ fontSize: "18px", fontWeight: "bold", color: userName ? "green" : "black" }}>
        {userName ? `Welcome, ${userName}! Redirecting...` : status}
      </p>
      <div style={{ position: "relative", display: "inline-block" }}>
        <video ref={videoRef} autoPlay style={{ border: "2px solid #333", borderRadius: "10px", marginTop: "10px" }}></video>
        <canvas ref={canvasRef} style={{ position: "absolute", top: 0, left: 0 }}></canvas>
      </div>
    </div>
  );
};

export default FaceLogin;
