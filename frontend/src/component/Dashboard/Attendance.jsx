import React, { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import AttendanceChart from './AttendanceChart';
import SideBar   from '../SideBar';
import Header from "../Header";

import '../../styles/AttendanceChart.css';

const Dashboard = () => {
  const [attendanceView, setAttendanceView] = useState('monthly');
  const [attendanceChartType, setAttendanceChartType] = useState('default');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
  

  const handleAttendanceViewChange = (e) => {
    setAttendanceView(e.target.value);
  };
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setIsLoggedIn(false);
    navigate("/");
  };

  return (
    <>
      <Header isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      <div className="main-container">
        <div className="sidebar-container">
          <SideBar />
        </div>
        <div className="dashboard" style={{ flex: 1, padding: '20px' }}>
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="section-content"
            >
              <div className="section-header">
                <h2>Attendance Analytics</h2>
                <div className="view-controls">
                  <select 
                    value={attendanceView} 
                    onChange={handleAttendanceViewChange}
                    className="view-selector"
                  >
                    <option value="monthly">Monthly View</option>
                    <option value="yearly">Yearly View</option>
                  </select>
                </div>
              </div>
  
              <div className="chart-type-buttons">
                <button 
                  className={`chart-type-button ${attendanceChartType === 'default' ? 'active' : ''}`}
                  onClick={() => setAttendanceChartType('default')}
                >
                  Default
                </button>
                <button 
                  className={`chart-type-button ${attendanceChartType === 'bar' ? 'active' : ''}`}
                  onClick={() => setAttendanceChartType('bar')}
                >
                  Bar Chart
                </button>
                <button 
                  className={`chart-type-button ${attendanceChartType === 'line' ? 'active' : ''}`}
                  onClick={() => setAttendanceChartType('line')}
                >
                  Line Chart
                </button>
                <button 
                  className={`chart-type-button ${attendanceChartType === 'area' ? 'active' : ''}`}
                  onClick={() => setAttendanceChartType('area')}
                >
                  Area Chart
                </button>
              </div>
  
              <div className="full-width-chart-card">
                <div className="chart-container">
                  <AttendanceChart 
                    view={attendanceView} 
                    chartType={attendanceChartType}
                  />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </>
  );
};

export default Dashboard;