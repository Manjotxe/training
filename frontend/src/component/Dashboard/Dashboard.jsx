import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import Header from "../Header.jsx";
import SideBar from "../SideBar.jsx";
import { format, parse } from "date-fns";

import "./Dashboard.css";

const Dashboard = () => {
  const [attendanceView, setAttendanceView] = useState("monthly");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [courseData, setCourseData] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]); // New State for Attendance Data
  const navigate = useNavigate();
  const [totalStudents, setTotalStudents] = useState(0);
  const [averageAttendance, setAverageAttendance] = useState(0);
  const [newAdmissions, setNewAdmissions] = useState(0);
  const [totalCourses, setTotalCourses] = useState(0);

  const COLORS = ["#0e7490", "#06b6d4", "#10b981", "#3b82f6", "#8b5cf6"];
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setIsLoggedIn(false);
    navigate("/");
  };
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "http://localhost:5000/students/courses"
        );
        const pieChartData = response.data.map((item) => ({
          name: item.course,
          value: item.total_students,
        }));
        setCourseData(pieChartData);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch student course data");
        setLoading(false);
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [attendanceRes, studentsRes, admissionsRes, coursesRes] =
          await Promise.all([
            axios.get("http://localhost:5000/api/attendance"),
            axios.get("http://localhost:5000/total-students"),
            axios.get("http://localhost:5000/new-admissions"),
            axios.get("http://localhost:5000/total-courses"),
          ]);

        setAttendanceData(attendanceRes.data);
        setTotalStudents(studentsRes.data.totalStudents);
        setNewAdmissions(admissionsRes.data.newAdmissions);
        setTotalCourses(coursesRes.data.totalCourses);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <Header isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      <div className="sidebarr-container">
        <SideBar />
      </div>
      <div className="dashboard">
        <div className="dashboard-header">
          <h2>Educational Performance Overview</h2>
          <p>
            Comprehensive analytics for attendance, admissions, and student
            performance
          </p>
        </div>

        <div className="dashboard-grid">
          {/* Pie Chart for Course Distribution */}
          <motion.div
            className="chart-card"
            whileHover={{
              scale: 1.02,
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
            }}
            transition={{ duration: 0.3 }}
          >
            <div className="card-header">
              <h3>Course Distribution</h3>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={courseData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} (${(percent * 100).toFixed(0)}%)`
                    }
                  >
                    {courseData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name, props) => {
                      const percent = props.payload?.percent;
                      return percent !== undefined
                        ? `${value} (${(percent * 100).toFixed(0)}%)`
                        : `${value}`;
                    }}
                  />
                  <Legend
                    iconType="circle"
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    wrapperStyle={{
                      paddingTop: "10px",
                      color: "#64748b",
                      fontSize: "0.85rem",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Bar Chart for Attendance Records */}
          <motion.div
            className="chart-card"
            whileHover={{
              scale: 1.02,
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
            }}
            transition={{ duration: 0.3 }}
          >
            <div className="card-header">
              <h3>Attendance Records</h3>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    tickFormatter={(tick) => {
                      const date = parse(tick, "yyyy-MM", new Date());
                      return format(date, "MMMM, yyyy"); // Converts "2025-02" -> "February, 2025"
                    }}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="present" fill="#10b981" name="Present" />
                  <Bar dataKey="absent" fill="#ef4444" name="Absent" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Summary Cards */}
        <div className="dashboard-summary">
          <motion.div
            className="summary-card"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <h4>Total Students</h4>
            <p className="summary-value">{totalStudents}</p>
          </motion.div>

          <motion.div
            className="summary-card"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <h4>New Admissions</h4>
            <p className="summary-value">{newAdmissions}</p>
          </motion.div>

          <motion.div
            className="summary-card"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <h4>Total Courses</h4>
            <p className="summary-value">{totalCourses}</p>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
