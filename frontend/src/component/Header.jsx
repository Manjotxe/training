import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

function Header({ isLoggedIn, onLogout, handleCoursesClick }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("ID");
  const dropdownRef = useRef(null);
  const location = useLocation();
  const [previousPath, setPreviousPath] = useState(location.pathname);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleAdminDropdown = (e) => {
    e.preventDefault();
    setIsAdminDropdownOpen(!isAdminDropdownOpen);
  };

  // Check if the current path matches the link and apply appropriate classes
  const isActive = (path) => {
    // Check if active
    const active = (path === "/" && location.pathname === "/") || 
                   (path !== "/" && location.pathname.startsWith(path));
    
    // Check if newly active (path just changed)
    const isNewActive = active && previousPath !== location.pathname;
    
    return active ? (isNewActive ? "active new-active" : "active") : "";
  };

  // Update previous path when location changes
  useEffect(() => {
    setPreviousPath(location.pathname);
  }, [location.pathname]);

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
            <Link to="/" className={`nav-item ${isActive("/")}`}>
              Home
            </Link>
            {role === "admin" ? (
              <Link to="/chatadmin" className={`nav-item ${isActive("/chatadmin")}`}>
                Chat
              </Link>
            ) : role === "user" ? (
              <Link to="/chat" className={`nav-item ${isActive("/chat")}`}>
                Chat
              </Link>
            ) : null}
            {role === "admin" && (
              <Link to="/admission" className={`nav-item ${isActive("/admission")}`}>
                Admissions
              </Link>
            )}
            {role === "admin" && (
              <Link to="/attendance" className={`nav-item ${isActive("/attendance")}`}>
                Mark Attendance
              </Link>
            )}

            <Link to="/course" onClick={handleCoursesClick} className={`nav-item ${isActive("/course")}`}>
              Courses
            </Link>

            {role === "user" && (
              <Link to={`/assignments/${userId}`} className={`nav-item ${isActive("/assignments")}`}>
                Assignments
              </Link>
            )}
            {role === "user" && (
              <Link to="/studentlogs" className={`nav-item ${isActive("/studentlogs")}`}>
                Student Logs
              </Link>
            )}

            {isLoggedIn ? (
              <Link to="/lectures" className={`nav-item ${isActive("/lectures")}`}>
                TimeTable
              </Link>
            ) : (
              <Link to="/login" className={`nav-item ${isActive("/login")}`}>
                TimeTable
              </Link>
            )}

            {/* Admin dropdown menu */}
            {role === "admin" && (
              <div className="custom-dropdown" ref={dropdownRef}>
                <a 
                  href="#" 
                  className={`nav-item ${
                    isActive("/canvas") || 
                    isActive("/data") || 
                    isActive("/dashboard") || 
                    isActive("/add-lecture") || 
                    isActive("/assignment") ? "active" : ""
                  }`} 
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
                  <Link to="/canvas" className={isActive("/canvas")}>
                    Inquiry Form
                  </Link>
                  <Link to="/data" className={isActive("/data")}>
                    All Students
                  </Link>
                  <Link to="/dashboard" className={isActive("/dashboard")}>
                    Records
                  </Link>
                  <Link to="/add-lecture" className={isActive("/add-lecture")}>
                    Add Lecture
                  </Link>
                  <Link to="/assignment" className={isActive("/assignment")}>
                    Assignments
                  </Link>
                </div>
              </div>
            )}

            {isLoggedIn ? (
              <Link to={`/profile/${userId}`} className={`nav-item ${isActive("/profile")}`}>
                MyProfile
              </Link>
            ) : (
              <Link to="/login" className={`nav-item ${isActive("/login")}`}>
                MyProfile
              </Link>
            )}

            {!isLoggedIn ? (
              <Link to="/login" className={`apply-now ${isActive("/login")}`}>
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