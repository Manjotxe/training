import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import styles from "../styles/login.module.css"; // Import the CSS Module

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [login, setLogin] = useState(false);
  const [load, setLoading] = useState(false);

  const submit = async (evt) => {
    evt.preventDefault();
    const loginData = { email, password };

    try {
      setLoading(true);
      const response = await axios.post(
        "http://localhost:5000/login",
        loginData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      const resData = response.data;
      if (resData.success) {
        setLogin(true);
        localStorage.setItem("token", resData.user.success);
        localStorage.setItem("role", resData.user.role); // Assuming the response contains `username`
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
        <div className={styles.container}>
          <div className={styles.mainDiv}>
            <div className={styles.title}>Login Form</div>
            <form onSubmit={submit}>
              <div className={styles.inputBox}>
                <input
                  type="email"
                  className="form-control"
                  onChange={(e) => setEmail(e.target.value)}
                  id="email"
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div className={styles.inputBox}>
                <input
                  type="password"
                  className="form-control"
                  onChange={(e) => setPassword(e.target.value)}
                  id="password"
                  placeholder="Enter your password"
                  required
                />
              </div>
              <div className={styles.optionDiv}>
                <div className={styles.checkBox}>
                  <input type="checkbox" />
                  <span>Remember me</span>
                </div>
                <div className={styles.forgetDiv}>
                  <a href="#">Forgot password?</a>
                </div>
              </div>
              <div className={styles.inputBox + " " + styles.button}>
                <input type="submit" value={load ? "Loading..." : "Login"} />
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Login;
