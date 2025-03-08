import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Header from '../Header';
import '../../styles/StudentLogsManage.css';
import axios from 'axios';
import TaskLogForm from './StudentLogForm';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = 'http://localhost:5000/logs';

const TaskLogManager = () => {
  const [showForm, setShowForm] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const [logs, setLogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 5;
  const [tableHeight, setTableHeight] = useState(0);
  const tableContainerRef = useRef(null);
  const [formData, setFormData] = useState({
    date: '',
    projectName: '',
    taskName: '',
    taskDescription: '',
    status: '',
    timeTaken: '',
    remarks: ''
  });

  useEffect(() => {
    fetchLogs();
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
    const studentId = localStorage.getItem('ID'); // Get student ID from localStorage
  
    if (!studentId) {
      console.error('Student ID not found in localStorage');
      return;
    }
  
    try {
      const response = await axios.get(`${API_URL}?student_id=${studentId}`); // Pass student_id as query parameter
      const formattedData = response.data.map((row) => ({
        date: row[0],
        projectName: row[1],
        taskName: row[2],
        taskDescription: row[3],
        status: row[4],
        timeTaken: row[5],
        remarks: row[6]
      }));
      setLogs(formattedData);
    } catch (error) {
      console.error('Failed to fetch logs', error);
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
    const studentId = localStorage.getItem('ID'); // Get student ID from localStorage
  
    if (!studentId) {
      console.error('Student ID not found in localStorage');
      return;
    }
  
    const finalFormData = {
      ...formData,
      student_id: studentId // Add student_id to formData
    };
  
    try {
      await axios.post(API_URL, finalFormData);
      fetchLogs();
      setFormData({
        date: '',
        projectName: '',
        taskName: '',
        taskDescription: '',
        status: '',
        timeTaken: '',
        remarks: ''
      });
      setShowForm(false);
    } catch (error) {
      console.error('Failed to add log', error);
    }
  };
  

  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = logs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(logs.length / logsPerPage);

  const emptyRowsCount = logsPerPage - currentLogs.length;
  const emptyRows = Array(emptyRowsCount > 0 ? emptyRowsCount : 0).fill(null);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <Header isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      <div className="theme-container" style={{ maxWidth: '100%', width: '100%' }}>
        <div className="header-container">
          <h1 className="gradient-text">Task Manager</h1>
          <button onClick={() => setShowForm(!showForm)} className="add-button">
            {showForm ? 'Cancel' : '+ Add Task Log'}
          </button>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              style={{ maxWidth: '100%', width: '100%' }}
            >
              <TaskLogForm formData={formData} handleChange={handleChange} handleSubmit={handleSubmit} setShowForm={setShowForm} />
            </motion.div>
          )}
        </AnimatePresence>

        <div 
          ref={tableContainerRef}
          className="table-container" 
          style={{ 
            height: tableHeight > 0 ? `${tableHeight}px` : 'auto',
            minHeight: '350px' 
          }}
        >
          <table className="task-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Project</th>
                <th>Task</th>
                <th>Task Description</th>
                <th>Status</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {currentLogs.map((log, index) => (
                <tr key={index}>
                  <td style={{ whiteSpace: 'nowrap' }}>{log.date}</td>
                  <td>{log.projectName}</td>
                  <td>{log.taskName}</td>
                  <td>{log.taskDescription}</td>
                  <td>{log.status}</td>
                  <td>{log.timeTaken}</td>
                </tr>
              ))}
              {emptyRows.map((_, index) => (
                <tr key={`empty-${index}`} style={{ height: '50px' }}>
                  <td>&nbsp;</td>
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
              className={currentPage === number + 1 ? 'active' : ''}
            >
              {number + 1}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default TaskLogManager;
