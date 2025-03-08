"use client";

import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  MapPin,
  GraduationCap,
  FileText,
  Users,
  Settings,
  Menu,
  ChevronRight,
} from "lucide-react";
import "../styles/Sidebar.css";

const Sidebar = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

  // Check if the current path matches or starts with the given path
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Sidebar link component with icon and modern styling
  const SidebarLink = ({ to, icon: Icon, children }) => (
    <Link to={to} className={`nav-link group ${isActive(to) ? "active" : ""}`}>
      <span className="nav-link-icon">
        <Icon size={20} strokeWidth={1.75} />
      </span>
      <span className="nav-link-text">{children}</span>
      <span className="nav-link-arrow">
        <ChevronRight
          size={16}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        />
      </span>
    </Link>
  );

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="sidebar-toggle d-md-none"
        aria-label="Open menu"
      >
        <Menu size={24} />
      </button>

      <aside className={`sidebar ${sidebarOpen ? "show" : ""}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <span className="logo-text">Student</span>
            <span className="logo-subtext">Records </span>
          </div>
        </div>

        <div className="sidebar-content">
          {/* Analytics Section */}
          <div className="sidebar-section-wrapper">
            <h6 className="sidebar-section">
              <span className="section-line"></span>
              <span className="section-text">Analytics</span>
              <span className="section-line"></span>
            </h6>
            <nav className="nav-group">
              <SidebarLink to="/dashboard" icon={LayoutDashboard}>
                Dashboard
              </SidebarLink>
              <SidebarLink to="/attendance-record" icon={ClipboardList}>
                Attendance Records
              </SidebarLink>
              <SidebarLink to="/record" icon={MapPin}>
                Locality Records
              </SidebarLink>
              <SidebarLink to="/course-record" icon={GraduationCap}>
                Course Records
              </SidebarLink>
            </nav>
          </div>

          {/* Management Section */}
          <div className="sidebar-section-wrapper">
            <h6 className="sidebar-section">
              <span className="section-line"></span>
              <span className="section-text">Management</span>
              <span className="section-line"></span>
            </h6>
            <nav className="nav-group">
              <SidebarLink to="#" icon={FileText}>
                Reports
              </SidebarLink>
              <SidebarLink to="/data" icon={Users}>
                Students
              </SidebarLink>
              <SidebarLink to="#" icon={Settings}>
                Settings
              </SidebarLink>
            </nav>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
