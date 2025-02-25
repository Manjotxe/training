import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import "../styles/login.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCircle, faEnvelope, faLock, faSignInAlt, faCamera, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

const AuthLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [login, setLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Toggle password visibility

  const submit = async (evt) => {
    evt.preventDefault();
    const loginData = { email, password };

    try {
      setLoading(true);
      const response = await axios.post(
        "http://127.0.0.1:5000/login",
        loginData,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      const resData = response.data;
      if (resData.success) {
        setLogin(true);
        localStorage.setItem("token", resData.user.success);
        localStorage.setItem("role", resData.user.role);
        localStorage.setItem("ID", resData.user.id);
      } else {
        Swal.fire({
          title: "Login Failed",
          text: resData.message || "Invalid credentials.",
          icon: "error",
        }).then(() => {
          window.location.href = "/login";
        });
      }
    } catch (error) {
      console.error("Error during login:", error);
      Swal.fire({
        title: "Login Failed",
        text: "Something went wrong. Please try again.",
        icon: "error",
      });
    }
    setLoading(false);
  };

  return (
    <>
      {login ? (
        <Navigate to="/" />
      ) : (
        <div className="auth-login-container">
          <div className="auth-login-box">
            <div className="auth-login-header">
              <FontAwesomeIcon icon={faUserCircle} className="auth-profile-icon" />
              <h2>Welcome Back</h2>
              <p className="auth-subtitle">Please login to your account</p>
            </div>
            <form onSubmit={submit} className="auth-login-form">
              <div className="auth-input-group">
                <FontAwesomeIcon icon={faEnvelope} className="auth-input-icon" />
                <input
                  type="email"
                  placeholder="Email"
                  required
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="auth-input-group">
                <FontAwesomeIcon icon={faLock} className="auth-input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  required
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="auth-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>
              <button type="submit" className="auth-login-btn">
                <FontAwesomeIcon icon={faSignInAlt} /> {loading ? "Loading..." : "Login"}
              </button>
              <div className="auth-alternative-login">
                <button type="button" id="faceLoginBtn" className="auth-face-login-btn">
                  <FontAwesomeIcon icon={faCamera} /> Login with Face
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AuthLogin;