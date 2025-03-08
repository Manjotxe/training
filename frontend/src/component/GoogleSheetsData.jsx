import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SideBar from "./SideBar";
import Header from "./Header";
import { motion } from "framer-motion";
import { format } from "date-fns";
import "../styles/StudentTasksTracker.css";

const StudentTasksTracker = () => {
  const [tasksData, setTasksData] = useState([]);
  const [sheetNames, setSheetNames] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showRemarkModal, setShowRemarkModal] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  const [remark, setRemark] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;
  const navigate = useNavigate();

  // Fetch sheet names when component mounts
  useEffect(() => {
    const fetchSheetNames = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/sheets");
        if (!response.ok) {
          throw new Error("Failed to fetch sheet names");
        }
        const data = await response.json();
        setSheetNames(data);

        // Set first sheet as default if available
        if (data && data.length > 0) {
          setSelectedSheet(data[0]);
        }
      } catch (err) {
        setError("Failed to fetch sheet names");
        console.error("Error fetching sheet names:", err);
      }
    };

    fetchSheetNames();
  }, []);

  // Fetch data when selected sheet changes
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedSheet) return;

      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:5000/api/data?sheetName=${encodeURIComponent(
            selectedSheet
          )}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const data = await response.json();
        setTasksData(data);

        // Calculate last page and set it as current
        const dataLength = data.length > 1 ? data.length - 1 : 0; // Accounting for header row
        const lastPage = Math.max(1, Math.ceil(dataLength / recordsPerPage));
        setCurrentPage(lastPage); // Set to last page instead of first page

        setLoading(false);
      } catch (err) {
        setError("Failed to fetch task data");
        setLoading(false);
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, [selectedSheet]);

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

  const handleSheetChange = (e) => {
    setSelectedSheet(e.target.value);
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
          sheetName: selectedSheet, // Add selected sheet name to the request
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

  // Pagination functions
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;

  // We need to slice the taskData array but exclude the header row when paginating
  const currentRecords =
    tasksData && tasksData.length > 1
      ? [
          tasksData[0],
          ...tasksData.slice(1).slice(indexOfFirstRecord, indexOfLastRecord),
        ]
      : tasksData;

  const totalPages =
    tasksData && tasksData.length > 1
      ? Math.ceil((tasksData.length - 1) / recordsPerPage)
      : 0;

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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

  if (loading && !tasksData.length) {
    return (
      <div className="loading-container">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error && !tasksData.length) {
    return (
      <div className="error-container">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  // Safely get completed tasks count
  const completedTasksCount =
    tasksData && Array.isArray(tasksData) && tasksData.length > 1
      ? tasksData
          .slice(1)
          .filter((row) => row && row[4] && row[4] === "Completed").length
      : 0;

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
              <div className="header-top">
                <h2>Student Tasks Tracker</h2>
                <div className="sheet-selector-container">
                  <label htmlFor="sheetSelector">Select Student:</label>
                  <select
                    id="sheetSelector"
                    className="sheet-selector"
                    value={selectedSheet}
                    onChange={handleSheetChange}
                    disabled={loading || sheetNames.length === 0}
                  >
                    {sheetNames.length === 0 && (
                      <option value="">No students available</option>
                    )}
                    {sheetNames.map((name, index) => (
                      <option key={index} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="tasks-stats">
                <div className="stat-pill">
                  <span className="stat-label">Total Tasks</span>
                  <span className="stat-value">
                    {tasksData && Array.isArray(tasksData)
                      ? Math.max(0, tasksData.length - 1)
                      : 0}
                  </span>
                </div>
                <div className="stat-pill">
                  <span className="stat-label">Completed</span>
                  <span className="stat-value">{completedTasksCount}</span>
                </div>
                <div className="stat-pill">
                  <span className="stat-label">Page</span>
                  <span className="stat-value">{`${currentPage} / ${
                    totalPages || 1
                  }`}</span>
                </div>
              </div>
            </motion.div>

            {loading && (
              <div className="loading-overlay">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            )}

            {tasksData && Array.isArray(tasksData) && tasksData.length > 0 ? (
              <>
                <motion.div
                  className="table-responsive"
                  variants={itemVariants}
                >
                  <table className="tasks-table">
                    <thead>
                      <tr>
                        {/* Display all headers from the backend */}
                        {tasksData[0] &&
                          tasksData[0].map((header, index) => (
                            <th key={index}>
                              {header || `Column ${index + 1}`}
                            </th>
                          ))}
                      </tr>
                    </thead>
                    <tbody>
                      {currentRecords.slice(1).map((row, rowIndex) => {
                        // Skip rendering if row is undefined or empty
                        if (!row || !Array.isArray(row)) return null;

                        const isCompleted = row[4] === "Completed";
                        // Check if this row has a remark (at index 6)
                        const hasRemark = row[6] && row[6].trim() !== "";

                        // Calculate the actual row index in the full dataset
                        const actualRowIndex = indexOfFirstRecord + rowIndex;

                        return (
                          <tr
                            key={rowIndex}
                            className={isCompleted ? "completed-task" : ""}
                          >
                            <td>{formatDate(row[0])}</td>
                            <td>{row[1] || "—"}</td>
                            <td>{row[2] || "—"}</td>
                            <td className="task-description">
                              {row[3] || "—"}
                            </td>
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
                                    onClick={() =>
                                      openRemarkModal(actualRowIndex + 1)
                                    }
                                  >
                                    Edit
                                  </button>
                                </div>
                              ) : (
                                <button
                                  className="btn-add-remark"
                                  onClick={() =>
                                    openRemarkModal(actualRowIndex + 1)
                                  } // +1 to account for header row
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

                {/* Pagination controls */}
                {totalPages > 1 && (
                  <div className="pagination-container">
                    <button
                      className="pagination-button"
                      onClick={() => paginate(1)}
                      disabled={currentPage === 1}
                    >
                      &laquo;
                    </button>
                    <button
                      className="pagination-button"
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      &lsaquo;
                    </button>

                    <div className="pagination-info">
                      Page {currentPage} of {totalPages}
                    </div>

                    <button
                      className="pagination-button"
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      &rsaquo;
                    </button>
                    <button
                      className="pagination-button"
                      onClick={() => paginate(totalPages)}
                      disabled={currentPage === totalPages}
                    >
                      &raquo;
                    </button>
                  </div>
                )}
              </>
            ) : (
              !loading && (
                <div className="no-data-message">
                  <p>No task data available for this student.</p>
                </div>
              )
            )}

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
