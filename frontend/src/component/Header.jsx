import React, { useState } from "react";
import { Link } from "react-router-dom";

function Header({ isLoggedIn, onLogout, handleCoursesClick }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State to manage menu visibility
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("ID");

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen); // Toggle menu visibility
  };

  return (
    <header className="header">
      <nav>
        <div className="top-bar">
          <div className="left-links">
            <a href="#">About Us</a>
            <a href="#">DEB-ID</a>
            <a href="#">CONTACT US</a>
          </div>
          <div className="right-contact">
            <span>+91-1824-521350</span>
            <div className="social-icons">
              <a href="#" className="facebook">
                f
              </a>
              <a href="#" className="instagram">
                i
              </a>
              <a href="#" className="linkedin">
                in
              </a>
              <a href="#" className="youtube">
                yt
              </a>
            </div>
          </div>
        </div>
        <div className="main-nav">
          <div className="logo">
            <h2>Training</h2>
          </div>
          <button className="menu-toggle" onClick={toggleMenu}>
            {/* Toggle button for smaller screens */}☰
          </button>
          <div className={`nav-links ${isMenuOpen ? "show" : ""}`}>
            <a href="/">Home</a>
            {role === "admin" && <a href="/admission">Admissions</a>}
            <a href="/course" onClick={handleCoursesClick}>
              Courses
            </a>{" "}
            {role === "admin" ? (
              <a href="/assignment">Assignments</a>
            ) : role === "user" ? (
              <a href={`/assignments/${userId}`}>Assignments</a>
            ) : null}
            {role === "admin" && <a href="/data">All Students</a>}
            {isLoggedIn ? (
              <a href={`/profile/${userId}`}>MyProfile</a>
            ) : (
              <a href="/login">MyProfile</a>
            )}
            {!isLoggedIn ? (
              <Link to="/login" className="apply-now">
                Login
              </Link>
            ) : (
              <button onClick={onLogout} className="apply-now">
                Logout
              </button>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Header;
