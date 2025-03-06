import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from "axios";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import Header from '../Header.jsx';
import SideBar from '../SideBar.jsx';
import './Dashboard.css';

const Dashboard = () => {
  const [courseData, setCourseData] = useState([]);
  const [locationData, setLocationData] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [newAdmissions, setNewAdmissions] = useState(0);
  const [totalCourses, setTotalCourses] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  const COLORS = ['#0e7490', '#06b6d4', '#10b981', '#3b82f6', '#8b5cf6'];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/students/courses");
        const pieChartData = response.data.map(item => ({
          name: item.course,
          value: item.total_students
        }));
        setCourseData(pieChartData);
      } catch (err) {
        console.error("Error fetching course data:", err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchSummaryData = async () => {
      try {
        const [studentsRes, admissionsRes, coursesRes] = await Promise.all([
          axios.get("http://localhost:5000/total-students"),
          axios.get("http://localhost:5000/new-admissions"),
          axios.get("http://localhost:5000/total-courses"),
        ]);

        setTotalStudents(studentsRes.data.totalStudents);
        setNewAdmissions(admissionsRes.data.newAdmissions);
        setTotalCourses(coursesRes.data.totalCourses);
      } catch (error) {
        console.error("Error fetching summary data:", error);
      }
    };
    fetchSummaryData();
  }, []);

  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/students/location");
        setLocationData(response.data);
      } catch (error) {
        console.error("Error fetching location data:", error);
      }
    };
    fetchLocationData();
  }, []);

  // Function to create custom tooltip that shows location name and count
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip" style={{ backgroundColor: 'white', padding: '10px', border: '1px solid #ccc' }}>
          <p className="label">{`Location: ${payload[0].payload.location}`}</p>
          <p className="label">{`Students: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  // Custom legend that removes the colored box
  const CustomBarLegend = () => {
    return (
      <div style={{ textAlign: 'center', marginTop: '-30px'}}>
        <span style={{ fontSize: '14px' }}>Students</span>
      </div>
    );
  };

  return (
    <>
      <Header isLoggedIn={isLoggedIn} onLogout={() => { localStorage.removeItem("token"); navigate("/"); }} />
      <div className="sidebarr-container">
        <SideBar />
      </div>
      <div className="dashboard">
        <div className="dashboard-header">
          <h2>Educational Performance Overview</h2>
          <p>Comprehensive analytics for attendance, admissions, and student performance</p>
        </div>

        <div className="dashboard-grid">
          <motion.div className="chart-card" whileHover={{ scale: 1.02 }} transition={{ duration: 0.3 }}>
            <div className="card-header">
              <h3>Course Distribution</h3>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={courseData} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value">
                    {courseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" align="center" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div className="chart-card" whileHover={{ scale: 1.02 }} transition={{ duration: 0.3 }}>
            <div className="card-header">
              <h3>Students by Location</h3>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                  data={locationData} 
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="location" 
                    tick={false}
                    axisLine={true}
                  />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="student_count">
                    {locationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
                <CustomBarLegend />
              </ResponsiveContainer>
              
            </div>
          </motion.div>
        </div>

        <div className="dashboard-summary">
          <motion.div className="summary-card" whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
            <h4>Total Students</h4>
            <p>{totalStudents}</p>
          </motion.div>
          <motion.div className="summary-card" whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
            <h4>New Admissions</h4>
            <p>{newAdmissions}</p>
          </motion.div>
          <motion.div className="summary-card" whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
            <h4>Total Courses</h4>
            <p>{totalCourses}</p>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;