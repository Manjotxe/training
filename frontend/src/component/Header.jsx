import React from "react";
import { Link } from "react-router-dom";

function Header({ isLoggedIn, onLogout }) {
  // Get the role from localStorage (or sessionStorage, or wherever it is stored)
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("ID"); // Assuming you store the role in localStorage

  return (
    <header className="header">
      <nav>
        <div className="top-bar">
          <div className="left-links">
            <a href="#">STUDY MATERIAL</a>
            <a href="#">CAMPUS VISIT</a>
            <a href="#">PUBLIC NOTICE</a>
            <a href="#">RECOGNITIONS</a>
            <a href="#" className="active">
              ONLINE EDUCATION
            </a>
            <a href="#" className="deb-id">
              DEB-ID
            </a>
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
          <div className="nav-links">
            <a href="#">About</a>
            {role === "admin" ? <a href="/admission">Admissions</a> : null}{" "}
            {/* Show "Admissions" only for admin */}
            <a href="#">Programs</a>
            <a href="#">Placements</a>
            <a href="#">e-Connect</a>
            {isLoggedIn ? (
            <a href={`/profile/${userId}`}>MyProfile</a>
            ) : (
              <a href="/login">MyProfile</a>
            )}
            {/* Conditional rendering for login/logout */}
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
