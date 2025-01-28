import React, { useRef, useEffect, useState } from "react";
import io from "socket.io-client";

const CanvasComponent = () => {
  const canvasRef = useRef(null);
  const socket = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    // Initialize socket connection
    socket.current = io("http://localhost:5001");

    // Listen for drawing data
    socket.current.on("canvas-data", (data) => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const image = new Image();
      image.onload = () => ctx.drawImage(image, 0, 0);
      image.src = data;
    });

    return () => socket.current.disconnect();
  }, []);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    if (e.touches) {
      // Touch events
      const touch = e.touches[0];
      return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
    } else {
      // Mouse events
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }
  };

  const startDrawing = (e) => {
    e.preventDefault();
    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const stopDrawing = (e) => {
    e.preventDefault();
    setIsDrawing(false);
    socket.current.emit("canvas-data", canvasRef.current.toDataURL());
  };

  const draw = (e) => {
    e.preventDefault();
    if (!isDrawing) return;
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current.getContext("2d");

    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "black";

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  return (
    <div>
      <h1>Canvas Component</h1>
      <canvas
        ref={canvasRef}
        width={800}
        height={400}
        style={{ border: "1px solid black" }}
        onMouseDown={startDrawing}
        onMouseUp={stopDrawing}
        onMouseMove={draw}
        onTouchStart={startDrawing}
        onTouchEnd={stopDrawing}
        onTouchMove={draw}
      />
    </div>
  );
};

export default CanvasComponent;
