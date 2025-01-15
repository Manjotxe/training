import React, { useState, useEffect } from "react";
import "../styles/App.css";
import { Link } from "react-router-dom";
import Header from "./Header"; // Import the Header component
import Footer from "./Footer"; // Import the Footer component

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);
  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove the token from localStorage
    localStorage.removeItem("role"); // Remove the token from localStorage
    setIsLoggedIn(false); // Update the state to reflect logout
  };

  return (
    <div className="app">
      <Header isLoggedIn={isLoggedIn} onLogout={handleLogout} />{" "}
      {/* Pass props to Header */}
      <main className="main-content">
        <div className="content-wrapper">
          <div className="text-content">
            <h2>Training</h2>
            <h1>YOUR EDUCATION YOUR WAY</h1>
            {/* Conditional rendering for Login/Get Started button */}
            {!isLoggedIn ? (
              <Link to="/login" className="login-btn">
                LOGIN
              </Link>
            ) : (
              <Link to="/get-started" className="login-btn">
                GET STARTED
              </Link>
            )}
          </div>
        </div>
      </main>
      <Footer /> {/* Use the Footer component */}
    </div>
  );
}

export default App;
