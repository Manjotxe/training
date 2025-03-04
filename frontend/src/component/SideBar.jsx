"use client";

import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { X, Menu } from "lucide-react";
import "../styles/Sidebar.css"; // Import custom CSS for additional styling

const Sidebar = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, []);

  // Check if the current path matches or starts with the given path
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="btn btn-primary d-md-none menu-btn"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      <aside className={`sidebar ${sidebarOpen ? "show" : ""}`}>
        <div className="sidebar-header">
          <span className="sidebar-title">Student Attendance Records</span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="btn-close d-md-none"
          ></button>
        </div>

        <div className="sidebar-content">
          {/* Analytics Section */}
          <h6 className="sidebar-section">Analytics</h6>
          <nav className="nav flex-column">
            <Link
              to="/dashboard"
              className={`nav-link ${isActive("/dashboard") ? "active" : ""}`}
            >
              Dashboard
            </Link>
            <Link
              to="/record"
              className={`nav-link ${isActive("/record") ? "active" : ""}`}
            >
              Locality Records
            </Link>
            <Link
              to="/reports"
              className={`nav-link ${isActive("/reports") ? "active" : ""}`}
            >
              Reports
            </Link>
          </nav>

          {/* Management Section */}
          <h6 className="sidebar-section mt-3">Management</h6>
          <nav className="nav flex-column">
            <Link
              to="/students"
              className={`nav-link ${isActive("/students") ? "active" : ""}`}
            >
              Students
            </Link>
            <Link
              to="/courses"
              className={`nav-link ${isActive("/courses") ? "active" : ""}`}
            >
              Courses
            </Link>
            <Link
              to="/admissions"
              className={`nav-link ${isActive("/admissions") ? "active" : ""}`}
            >
              Admissions
            </Link>
            <Link
              to="/settings"
              className={`nav-link ${isActive("/settings") ? "active" : ""}`}
            >
              Settings
            </Link>
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
