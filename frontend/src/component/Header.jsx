import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

function Header({ isLoggedIn, onLogout, handleCoursesClick }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("ID");
  const dropdownRef = useRef(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleAdminDropdown = (e) => {
    e.preventDefault();
    setIsAdminDropdownOpen(!isAdminDropdownOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsAdminDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
            ☰
          </button>
          <div className={`nav-links ${isMenuOpen ? "show" : ""}`}>
            <a href="/">Home</a>
            {role === "admin" ? (
              <a href="/chatadmin">Chat</a>
            ) : role === "user" ? (
              <a href={`/chat`}>Chat</a>
            ) : null}
            {role === "admin" && <a href="/admission">Admissions</a>}

            <a href="/course" onClick={handleCoursesClick}>
              Courses
            </a>

            {role === "user" && (
              <a href={`/assignments/${userId}`}>Assignments</a>
            )}

            {isLoggedIn ? (
              <a href="/lectures">TimeTable</a>
            ) : (
              <a href="/login">TimeTable</a>
            )}

            {/* Admin dropdown menu */}
            {role === "admin" && (
              <div className="custom-dropdown" ref={dropdownRef}>
                <a
                  href="#"
                  className="dropdown-toggle"
                  onClick={toggleAdminDropdown}
                >
                  Admin Tools{" "}
                  <span
                    className={`dropdown-arrow ${
                      isAdminDropdownOpen ? "rotate" : ""
                    }`}
                  >
                    ▼
                  </span>
                </a>
                <div
                  className="dropdown-content"
                  style={{ display: isAdminDropdownOpen ? "block" : "none" }}
                >
                  <a href="/canvas">Inquiry Form</a>
                  <a href="/data">All Students</a>
                  <a href="/add-lecture">Add Lecture</a>
                  <a href="/assignment">Assignments</a>
                </div>
              </div>
            )}

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
