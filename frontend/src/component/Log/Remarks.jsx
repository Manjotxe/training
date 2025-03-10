import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Header';
import '../../styles/StudentLogsManage.css';
import axios from 'axios';
import { motion } from 'framer-motion';

const API_URL = 'http://localhost:5000/logs';

const RemarksView = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const [remarks, setRemarks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const remarksPerPage = 10;
  const [tableHeight, setTableHeight] = useState(0);
  const tableContainerRef = useRef(null);

  useEffect(() => {
    fetchRemarks();
  }, []);

  useEffect(() => {
    if (remarks.length > 0 && currentPage === 1 && tableContainerRef.current) {
      const height = tableContainerRef.current.offsetHeight;
      setTableHeight(height);
    }
  }, [remarks, currentPage]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    } else {
      navigate("/"); // Redirect to login if not logged in
    }
  }, [navigate]);

  const fetchRemarks = async () => {
    const studentId = localStorage.getItem('ID');

    if (!studentId) {
      console.error('Student ID not found in localStorage');
      return;
    }

    try {
      const response = await axios.get(`${API_URL}?student_id=${studentId}`);
      // Only extract date and remark fields
      const formattedData = response.data.map((row) => ({
        date: row[0],
        remark: row[6]
      }));
      // Filter out entries with empty remarks
      const filteredData = formattedData.filter(item => item.remark && item.remark.trim() !== '');
      setRemarks(filteredData);
    } catch (error) {
      console.error('Failed to fetch remarks', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setIsLoggedIn(false);
    navigate("/");
  };

  const handleBackToTaskManager = () => {
    navigate("/studentlogs");
  };

  const indexOfLastRemark = currentPage * remarksPerPage;
  const indexOfFirstRemark = indexOfLastRemark - remarksPerPage;
  const currentRemarks = remarks.slice(indexOfFirstRemark, indexOfLastRemark);
  const totalPages = Math.ceil(remarks.length / remarksPerPage);

  const emptyRowsCount = remarksPerPage - currentRemarks.length;
  const emptyRows = Array(emptyRowsCount > 0 ? emptyRowsCount : 0).fill(null);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <Header isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      <div className="theme-container" style={{ maxWidth: '100%', width: '100%' }}>
        <div className="header-container">
          <h1 className="gradient-text">Remarks View</h1>
          <button onClick={handleBackToTaskManager} className="add-button">
            back to logs
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          style={{ maxWidth: '100%', width: '100%' }}
        >
          <div
            ref={tableContainerRef}
            className="table-container"
            style={{
              height: tableHeight > 0 ? `${tableHeight}px` : 'auto',
              minHeight: '450px'
            }}
          >
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
                      <td style={{ whiteSpace: 'nowrap' }}>{item.date}</td>
                      <td>{item.remark}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2" style={{ textAlign: 'center' }}>No remarks found</td>
                  </tr>
                )}
                {emptyRows.map((_, index) => (
                  <tr key={`empty-${index}`} style={{ height: '50px' }}>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {totalPages > 1 && (
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
        )}
      </div>
    </>
  );
};

export default RemarksView;