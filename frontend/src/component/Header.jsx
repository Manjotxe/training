import React, { useState } from "react";
import { Link } from "react-router-dom";

<<<<<<< HEAD
function Header({ isLoggedIn, onLogout }) {
  const [menuVisible, setMenuVisible] = useState(false); // State to toggle menu visibility
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("ID");
  

  const toggleMenu = () => {
    setMenuVisible(!menuVisible); // Toggle the menu visibility
=======
function Header({ isLoggedIn, onLogout, handleCoursesClick }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State to manage menu visibility
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("ID");

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen); // Toggle menu visibility
>>>>>>> e3aa18398a4297d46afb1a985017045bb40030d0
  };

  return (
    <header className="header">
      <nav>
        <div className="top-bar">
          <div className="left-links">
<<<<<<< HEAD
            <a href="#" className="">
             About Us
            </a>
            <a href="#" className="">
              DEB-ID
            </a>
=======
            <a href="#">About Us</a>
            <a href="#">DEB-ID</a>
>>>>>>> e3aa18398a4297d46afb1a985017045bb40030d0
            <a href="#">CONTACT US</a>
          </div>
          <div className="right-contact">
            <span>+91-1824-521350</span>
            <div className="social-icons">
              <a href="#" className="facebook">f</a>
              <a href="#" className="instagram">i</a>
              <a href="#" className="linkedin">in</a>
              <a href="#" className="youtube">yt</a>
            </div>
          </div>
        </div>
        <div className="main-nav">
          <div className="logo">
            <h2>Training</h2>
          </div>
<<<<<<< HEAD
          <div className={`nav-links ${menuVisible ? 'show' : ''}`}>
            <a href="/">Home</a>
            {role === "admin" ? <a href="/admission">Admissions</a> : null}
            <Link to="/courses"  >
              Course
            </Link>
            <Link to="/bill"  >
              Bill
            </Link>
            <a href="#">e-Connect</a>
=======
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
>>>>>>> e3aa18398a4297d46afb1a985017045bb40030d0
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
          <div className="menu-icon" onClick={toggleMenu}>
            &#9776; {/* Hamburger icon */}
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Header;
