import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const role = localStorage.getItem("role"); // Get role from localStorage

  if (role === "admin") {
    return children; // Render the protected route
  } else {
    return <Navigate to="/" replace />; // Redirect to home
  }
};

export default PrivateRoute;
