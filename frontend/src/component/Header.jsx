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
            <a href="#" className="top-link">
              About Us
            </a>
            <a href="#" className="top-link deb-id">
              DEB-ID
            </a>
            <a href="#" className="top-link">
              CONTACT US
            </a>
          </div>
          <div className="right-contact">
            <span className="phone-number">+91-1824-521350</span>
            <div className="social-icons">
              <a
                href="#"
                className="social-icon facebook"
                aria-label="Facebook"
              >
                <i className="fa-brands fa-facebook-f"></i>
              </a>
              <a
                href="#"
                className="social-icon instagram"
                aria-label="Instagram"
              >
                <i className="fa-brands fa-instagram"></i>
              </a>
              <a
                href="#"
                className="social-icon linkedin"
                aria-label="LinkedIn"
              >
                <i className="fa-brands fa-linkedin-in"></i>
              </a>
              <a href="#" className="social-icon youtube" aria-label="YouTube">
                <i className="fa-brands fa-youtube"></i>
              </a>
            </div>
          </div>
        </div>
        <div className="main-nav">
          <div className="logo">
            <h2>Training</h2>
          </div>
          <button
            className="menu-toggle"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
          <div className={`nav-links ${isMenuOpen ? "show" : ""}`}>
            <a href="/" className="nav-item">
              Home
            </a>
            {role === "admin" ? (
              <a href="/chatadmin" className="nav-item">
                Chat
              </a>
            ) : role === "user" ? (
              <a href={`/chat`} className="nav-item">
                Chat
              </a>
            ) : null}
            {role === "admin" && (
              <a href="/admission" className="nav-item">
                Admissions
              </a>
            )}
            {role === "admin" && (
              <a href="/attendance" className="nav-item">
                Mark Attendance
              </a>
            )}

            <a href="/course" onClick={handleCoursesClick} className="nav-item">
              Courses
            </a>

            {role === "user" && (
              <a href={`/assignments/${userId}`} className="nav-item">
                Assignments
              </a>
            )}

            {isLoggedIn ? (
              <a href="/lectures" className="nav-item">
                TimeTable
              </a>
            ) : (
              <a href="/login" className="nav-item">
                TimeTable
              </a>
            )}

            {/* Admin dropdown menu */}
            {role === "admin" && (
              <div className="custom-dropdown" ref={dropdownRef}>
                <a href="#" className="nav-item" onClick={toggleAdminDropdown}>
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
                  <a href="/record">Records</a>
                  <a href="/add-lecture">Add Lecture</a>
                  <a href="/assignment">Assignments</a>
                </div>
              </div>
            )}

            {isLoggedIn ? (
              <a href={`/profile/${userId}`} className="nav-item">
                MyProfile
              </a>
            ) : (
              <a href="/login" className="nav-item">
                MyProfile
              </a>
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
