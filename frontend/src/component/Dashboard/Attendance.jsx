import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import AttendanceChart from './AttendanceChart';
import SideBar from '../SideBar';
import Header from "../Header";

const Dashboard = () => {
  const [attendanceView, setAttendanceView] = useState('monthly');
  const [attendanceChartType, setAttendanceChartType] = useState('default');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [attendanceStats, setAttendanceStats] = useState({
    avgPresent: 0,
    avgAbsent: 0,
    totalStudents: 0
  });

  useEffect(() => {
    // Simulating API call or data calculation
    setTimeout(() => {
      setAttendanceStats({
        avgPresent: 75,  // Example percentage
        avgAbsent: 25,   // Example percentage
        totalStudents: 1200 // Example total students
      });
    }, 1000);
  }, []);

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
      <div style={{ display: 'flex', flex: 1 }}>
        <div className="sidebar-container">
          <SideBar />
        </div>        

        <div style={{ flex: 1, padding: '20px', background: '#F8F9FA', overflowY: 'auto', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, color: '#34495E' }}>Attendance Analytics</h2>
                <select 
                  value={attendanceView} 
                  onChange={handleAttendanceViewChange}
                  style={{ padding: '8px', borderRadius: '4px', border: '1px solid #BDC3C7' }}
                >
                  <option value="monthly">Monthly View</option>
                  <option value="yearly">Yearly View</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                {['default', 'bar', 'line', 'area'].map(type => (
                  <button 
                    key={type} 
                    onClick={() => setAttendanceChartType(type)}
                    style={{ 
                      padding: '10px', 
                      border: 'none', 
                      borderRadius: '4px', 
                      cursor: 'pointer', 
                      background: attendanceChartType === type ? '#2980B9' : '#BDC3C7', 
                      color: '#fff' 
                    }}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)} Chart
                  </button>
                ))}
              </div>

              <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
                <AttendanceChart view={attendanceView} chartType={attendanceChartType} />
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Attendance Statistics Section */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px', gap: '20px' }}>
            <div style={statBoxStyle}>
              <h3 style={statTitleStyle}>Average Present</h3>
              <p style={statValueStyle}>{attendanceStats.avgPresent}%</p>
            </div>
            <div style={statBoxStyle}>
              <h3 style={statTitleStyle}>Average Absent</h3>
              <p style={statValueStyle}>{attendanceStats.avgAbsent}%</p>
            </div>
            <div style={statBoxStyle}>
              <h3 style={statTitleStyle}>Total Students</h3>
              <p style={statValueStyle}>{attendanceStats.totalStudents}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Styles for the statistic boxes
const statBoxStyle = {
  flex: 1,
  background: '#fff',
  padding: '20px',
  borderRadius: '8px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  textAlign: 'center'
};

const statTitleStyle = {
  fontSize: '16px',
  color: '#34495E',
  marginBottom: '10px'
};

const statValueStyle = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#2980B9'
};

export default Dashboard;
