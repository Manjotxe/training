import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../Header";
import { Download } from "lucide-react"; // Import the Download icon

import "../../styles/StudentLogsManage.css";
import axios from "axios";
import TaskLogForm from "./StudentLogForm";
import { motion, AnimatePresence } from "framer-motion";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // Import autoTable separately




const API_URL = "http://localhost:5000/logs";

const StudentLogTable = () => {
  const [showForm, setShowForm] = useState(false);
  const [showRemarks, setShowRemarks] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [logs, setLogs] = useState([]);
  const [remarks, setRemarks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [remarksCurrentPage, setRemarksCurrentPage] = useState(1);
  const logsPerPage = 5;
  const remarksPerPage = 10;
  const [tableHeight, setTableHeight] = useState(0);
  const tableContainerRef = useRef(null);
  const navigate = useNavigate();

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0]; // Format: YYYY-MM-DD
  };

  const [formData, setFormData] = useState({
    date: getTodayDate(), // Set today's date as default
    projectName: "",
    taskName: "",
    taskDescription: "",
    status: "",
    timeTaken: "",
    remarks: "",
  });

  useEffect(() => {
    fetchLogs();
    fetchRemarks();
  }, []);

  useEffect(() => {
    if (logs.length > 0 && currentPage === 1 && tableContainerRef.current) {
      const height = tableContainerRef.current.offsetHeight;
      setTableHeight(height);
    }
  }, [logs, currentPage]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const fetchLogs = async () => {
    const studentId = localStorage.getItem("ID");
    if (!studentId) {
      console.error("Student ID not found in localStorage");
      return;
    }

    try {
      const response = await axios.get(`${API_URL}?student_id=${studentId}`);
      const formattedData = response.data.map((row) => ({
        date: row[0],
        projectName: row[1],
        taskName: row[2],
        taskDescription: row[3],
        status: row[4],
        timeTaken: row[5],
        remark: row[6],
      }));
      setLogs(formattedData);
    } catch (error) {
      console.error("Failed to fetch logs", error);
    }
  };

  const fetchRemarks = async () => {
    const studentId = localStorage.getItem("ID");

    if (!studentId) {
      console.error("Student ID not found in localStorage");
      return;
    }

    try {
      const response = await axios.get(`${API_URL}?student_id=${studentId}`);
      // Only extract date and remarks fields
      const formattedData = response.data.map((row) => ({
        date: row[0],
        remarks: row[6],
      }));
      // Filter out entries with empty remarks
      const filteredData = formattedData.filter(
        (item) => item.remarks && item.remarks.trim() !== ""
      );
      setRemarks(filteredData);
    } catch (error) {
      console.error("Failed to fetch remarks", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setIsLoggedIn(false);
    navigate("/");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const studentId = localStorage.getItem("ID");

    if (!studentId) {
      console.error("Student ID not found in localStorage");
      return;
    }

    const finalFormData = {
      ...formData,
      date: formData.date || getTodayDate(), // Ensure date is set
      student_id: studentId,
    };

    try {
      await axios.post(API_URL, finalFormData);
      fetchLogs();
      fetchRemarks();
      setFormData({
        date: getTodayDate(), // Reset form with today's date
        projectName: "",
        taskName: "",
        taskDescription: "",
        status: "",
        timeTaken: "",
        remarks: "",
      });
      setShowForm(false);
    } catch (error) {
      console.error("Failed to add log", error);
    }
  };

  // Toggle functions to ensure only one popup is visible at a time
  const toggleForm = () => {
    setShowForm(!showForm);
    if (showRemarks) setShowRemarks(false);
  };

  const toggleRemarks = () => {
    setShowRemarks(!showRemarks);
    if (showForm) setShowForm(false);
  };

  
  const generatePDF = () => {
    const doc = new jsPDF();

    doc.text("Student Task Logs", 14, 15);

    const tableColumn = ["Date", "Project", "Task", "Status", "Time Taken"];
    const tableRows = logs.map(log => [
        log.date, log.projectName, log.taskName, log.status, log.timeTaken
    ]);

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 20,
        theme: "grid",
        styles: { fontSize: 10, cellPadding: 2 },
        headStyles: { fillColor: [44, 62, 80] }
    });

    // Open PDF in new tab instead of downloading
    const pdfBlob = doc.output("blob");
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, "_blank");
};


  
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = logs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(logs.length / logsPerPage);

  const indexOfLastRemark = remarksCurrentPage * remarksPerPage;
  const indexOfFirstRemark = indexOfLastRemark - remarksPerPage;
  const currentRemarks = remarks.slice(indexOfFirstRemark, indexOfLastRemark);
  const totalRemarksPages = Math.ceil(remarks.length / remarksPerPage);

  const emptyRowsCount = logsPerPage - currentLogs.length;
  const emptyRows = Array(emptyRowsCount > 0 ? emptyRowsCount : 0).fill(null);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const paginateRemarks = (pageNumber) => setRemarksCurrentPage(pageNumber);

  return (
    <>
      <Header isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      <div
        className="theme-container"
        style={{ maxWidth: "100%", width: "100%" }}
      >
       <div className="header-container">
  <h1 className="gradient-text">Task Manager</h1>
  
  <div 
    className="buttons-container" 
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "10px",
      flexWrap: "wrap",
    }}
  >
    <button onClick={toggleRemarks} className="add-button">
      {showRemarks ? "Cancel" : "Show Remarks"}
    </button>
    
    <button onClick={toggleForm} className="add-button">
      {showForm ? "Cancel" : "+ Add Task Log"}
    </button>
    
    <button 
      onClick={generatePDF} 
      className="add-button" 
      style={{
        alignSelf: "center", // Ensures alignment in case of flex issues
      }}
    >
      <Download />
    </button>
  </div>
</div>


        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              style={{ maxWidth: "100%", width: "100%" }}
            >
              <TaskLogForm
                formData={formData}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
                setShowForm={setShowForm}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showRemarks && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              style={{ maxWidth: "100%", width: "100%" }}
              className="remarks-container"
            >
              <div className="remarks-header">
                <h2>Remarks Log</h2>
              </div>
              <div className="remarks-content">
                <table className="task-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRemarks.length > 0 ? (
                      currentRemarks.map((item, index) => (
                        <tr key={index}>
                          <td style={{ whiteSpace: "nowrap" }}>{item.date}</td>
                          <td>{item.remarks}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="2" style={{ textAlign: "center" }}>
                          No remarks found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {totalRemarksPages > 1 && (
                  <div className="pagination">
                    {[...Array(totalRemarksPages).keys()].map((number) => (
                      <button
                        key={number + 1}
                        onClick={() => paginateRemarks(number + 1)}
                        className={
                          remarksCurrentPage === number + 1 ? "active" : ""
                        }
                      >
                        {number + 1}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div
          ref={tableContainerRef}
          className="table-container"
          style={{
            height: tableHeight > 0 ? `${tableHeight}px` : "auto",
            minHeight: "350px",
          }}

        >





          <table className="task-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Project</th>
                <th>Task</th>
                <th>Status</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {currentLogs.map((log, index) => (
                <tr key={index}>
                  <td style={{ whiteSpace: "nowrap" }}>{log.date}</td>
                  <td>{log.projectName}</td>
                  <td>{log.taskName}</td>
                  <td>{log.status}</td>
                  <td>{log.timeTaken}</td>
                </tr>
              ))}
              {emptyRows.map((_, index) => (
                <tr key={`empty-${index}`} style={{ height: "50px" }}>
                  <td>&nbsp;</td>
                  <td>&nbsp;</td>
                  <td>&nbsp;</td>
                  <td>&nbsp;</td>
                  <td>&nbsp;</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          {[...Array(totalPages).keys()].map((number) => (
            <button
              key={number + 1}
              onClick={() => paginate(number + 1)}
              className={currentPage === number + 1 ? "active" : ""}
            >
              {number + 1}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default StudentLogTable;
