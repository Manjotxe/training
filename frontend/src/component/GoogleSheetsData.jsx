import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SideBar from "./SideBar";
import Header from "./Header";
import { motion } from "framer-motion";
import { format } from "date-fns";
import "../styles/StudentTasksTracker.css";

const StudentTasksTracker = () => {
  const [tasksData, setTasksData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showRemarkModal, setShowRemarkModal] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  const [remark, setRemark] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:5000/api/data");
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const data = await response.json();
        setTasksData(data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch task data");
        setLoading(false);
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setIsLoggedIn(false);
    navigate("/");
  };

  const openRemarkModal = (rowIndex) => {
    setSelectedRowIndex(rowIndex);
    // Safely check if the row and remark field exist
    setRemark(
      tasksData[rowIndex] && tasksData[rowIndex][6]
        ? tasksData[rowIndex][6]
        : ""
    );
    setShowRemarkModal(true);
  };

  const closeRemarkModal = () => {
    setShowRemarkModal(false);
    setSelectedRowIndex(null);
    setRemark("");
  };

  const handleRemarkChange = (e) => {
    setRemark(e.target.value);
  };

  const saveRemark = async () => {
    try {
      if (selectedRowIndex === null || !tasksData[selectedRowIndex]) {
        throw new Error("Invalid row selected");
      }

      const updatedRow = [...tasksData[selectedRowIndex]];
      updatedRow[6] = remark; // Update remarks in UI

      const response = await fetch("http://localhost:5000/api/update-remark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: updatedRow[0], // Use date instead of rowIndex
          remark: remark,
        }),
      });

      if (response.ok) {
        const updatedData = [...tasksData];
        updatedData[selectedRowIndex] = updatedRow;
        setTasksData(updatedData);
        closeRemarkModal();
      } else {
        throw new Error("Failed to update remark");
      }
    } catch (err) {
      console.error("Error updating remark:", err);
      alert("Failed to save remark. Please try again.");
    }
  };

  // Format date for display (e.g., from "2025-02-24" to "Feb 24, 2025")
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      return format(date, "MMM dd, yyyy");
    } catch (e) {
      return dateString; // Return original if formatting fails
    }
  };

  // Get status class safely
  const getStatusClass = (status) => {
    if (!status) return "status-unknown";
    return `status-${status.toLowerCase()}`;
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  // Ensure we have data and it's properly structured
  if (!tasksData || !Array.isArray(tasksData) || tasksData.length === 0) {
    return (
      <div className="error-container">
        <div className="alert alert-warning" role="alert">
          No task data available. Please check your data source.
        </div>
      </div>
    );
  }

  // Safely get completed tasks count
  const completedTasksCount = tasksData
    .slice(1)
    .filter((row) => row && row[4] && row[4] === "Completed").length;

  return (
    <>
      <Header isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      <div className="main-container">
        <div className="sidebar-container">
          <SideBar />
        </div>
        <motion.div
          className="content-container"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div
            className="tasks-tracker-component"
            variants={itemVariants}
          >
            <motion.div className="tasks-header" variants={itemVariants}>
              <h2>Student Tasks Tracker</h2>
              <div className="tasks-stats">
                <div className="stat-pill">
                  <span className="stat-label">Total Tasks</span>
                  <span className="stat-value">
                    {Math.max(0, tasksData.length - 1)}
                  </span>
                </div>
                <div className="stat-pill">
                  <span className="stat-label">Completed</span>
                  <span className="stat-value">{completedTasksCount}</span>
                </div>
              </div>
            </motion.div>

            <motion.div className="table-responsive" variants={itemVariants}>
              <table className="tasks-table">
                <thead>
                  <tr>
                    {/* Display all headers from the backend */}
                    {tasksData[0] &&
                      tasksData[0].map((header, index) => (
                        <th key={index}>{header || `Column ${index + 1}`}</th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {tasksData.slice(1).map((row, rowIndex) => {
                    // Skip rendering if row is undefined or empty
                    if (!row || !Array.isArray(row)) return null;

                    const isCompleted = row[4] === "Completed";
                    // Check if this row has a remark (at index 6)
                    const hasRemark = row[6] && row[6].trim() !== "";

                    return (
                      <tr
                        key={rowIndex}
                        className={isCompleted ? "completed-task" : ""}
                      >
                        <td>{formatDate(row[0])}</td>
                        <td>{row[1] || "—"}</td>
                        <td>{row[2] || "—"}</td>
                        <td className="task-description">{row[3] || "—"}</td>
                        <td>
                          {row[4] && (
                            <span
                              className={`status-badge ${getStatusClass(
                                row[4]
                              )}`}
                            >
                              {row[4]}
                            </span>
                          )}
                          {!row[4] && "—"}
                        </td>
                        <td>{row[5] || "—"}</td>
                        <td>
                          {/* Show remark if it exists */}
                          {hasRemark ? (
                            <div className="remark-container">
                              <span className="remark-text">{row[6]}</span>
                              <button
                                className="btn-edit-remark"
                                onClick={() => openRemarkModal(rowIndex + 1)}
                              >
                                Edit
                              </button>
                            </div>
                          ) : (
                            <button
                              className="btn-add-remark"
                              onClick={() => openRemarkModal(rowIndex + 1)} // +1 to account for header row
                            >
                              Add Remark
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </motion.div>

            {showRemarkModal && (
              <div className="remark-modal-overlay">
                <div className="remark-modal">
                  <div className="remark-modal-header">
                    <h3>{remark ? "Edit Remark" : "Add Remark"}</h3>
                    <button
                      className="close-modal-btn"
                      onClick={closeRemarkModal}
                    >
                      &times;
                    </button>
                  </div>
                  <div className="remark-modal-body">
                    <label htmlFor="remark">Teacher's Remark:</label>
                    <textarea
                      id="remark"
                      name="remark"
                      rows="4"
                      value={remark}
                      onChange={handleRemarkChange}
                      placeholder="Enter your remarks here..."
                    ></textarea>
                  </div>
                  <div className="remark-modal-footer">
                    <button className="btn-cancel" onClick={closeRemarkModal}>
                      Cancel
                    </button>
                    <button className="btn-save" onClick={saveRemark}>
                      Save Remark
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </>
  );
};

export default StudentTasksTracker;
