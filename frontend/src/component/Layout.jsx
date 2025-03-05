import React, { useState } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";

// import MainContent from './MainContent'; // Import the main content component

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Top Navigation Bar */}
      <div className="d-flex flex-1">
        {/* Sidebar - Mobile Overlay */}
        <div
          className={`position-fixed top-0 start-0 end-0 bottom-0 bg-black bg-opacity-50 d-md-none ${
            sidebarOpen ? "d-block" : "d-none"
          }`}
          onClick={() => setSidebarOpen(false)}
        ></div>

        {/* Sidebar */}
        <div
          className="bg-light shadow-lg position-fixed top-0 bottom-0 start-0 z-3 d-md-block"
          style={{
            width: "250px",
            transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
            transition: "transform 0.3s ease-in-out",
          }}
        >
          <div className="p-3 border-bottom">
            <div className="d-flex justify-content-between align-items-center">
              <div className="h4">Student Attendance Records</div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="d-md-none btn btn-close"
              ></button>
            </div>
          </div>

          {/* Sidebar Menu */}
          <div className="p-3">
            <h5 className="text-muted">Analytics</h5>
            <nav className="nav flex-column">
              <a href="#" className="nav-link active">
                <i className="bi bi-graph-up"></i> Attendance Rate
              </a>
              <a href="#" className="nav-link">
                <i className="bi bi-graph-down"></i> Participation
              </a>
              <a href="#" className="nav-link">
                <i className="bi bi-clock"></i> Tardiness
              </a>
            </nav>

            <h5 className="text-muted mt-4">Management</h5>
            <nav className="nav flex-column">
              <a href="#" className="nav-link">
                <i className="bi bi-person-circle"></i> Student Profiles
              </a>
              <a href="#" className="nav-link">
                <i className="bi bi-file-earmark"></i> Reports
              </a>
              <a href="#" className="nav-link">
                <i className="bi bi-bell"></i> Alerts & Notifications
              </a>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        {/* <main className="flex-fill p-4">
          <MainContent />
        </main> */}
      </div>
    </div>
  );
}

export default Layout;
