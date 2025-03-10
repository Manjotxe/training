import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SideBar from "./SideBar";
import Header from "./Header";
import { Pie, Bar, Doughnut } from "react-chartjs-2";
import axios from "axios";
import { motion } from "framer-motion"; // Import framer-motion
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import "../styles/StudentLocationChart.css";

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const StudentCourseGenderChart = () => {
  const [courseData, setCourseData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [chartType, setChartType] = useState("pie");
  const [view, setView] = useState("course");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "http://localhost:5000/students/courses"
        );
        setCourseData(response.data);
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
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const prepareChartData = () => {
    if (view === "course") {
      return {
        labels: courseData.map((item) => item.course),
        datasets: [
          {
            data: courseData.map((item) => item.total_students),
            backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
            borderWidth: 1,
          },
        ],
      };
    } else {
      return {
        labels: ["Male", "Female", "Other"],
        datasets: [
          {
            data: [
              courseData.reduce(
                (sum, item) => sum + parseInt(item.male_students),
                0
              ),
              courseData.reduce(
                (sum, item) => sum + parseInt(item.female_students),
                0
              ),
              courseData.reduce(
                (sum, item) => sum + parseInt(item.other_students),
                0
              ),
            ],
            backgroundColor: ["#4CAF50", "#FF69B4", "#FFCE56"],
            borderWidth: 1,
          },
        ],
      };
    }
  };

  const chartOptions = {
    plugins: {
      legend: { position: "right" },
    },
    maintainAspectRatio: false,
    responsive: true,
  };

  const renderChart = () => {
    const data = prepareChartData();
    switch (chartType) {
      case "pie":
        return <Pie data={data} options={chartOptions} />;
      case "doughnut":
        return <Doughnut data={data} options={chartOptions} />;
      case "bar":
        return <Bar data={data} options={chartOptions} />;
      default:
        return <Pie data={data} options={chartOptions} />;
    }
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
    return <div className="chart-container">Loading...</div>;
  }

  if (error) {
    return <div className="chart-container">{error}</div>;
  }

  return (
    <>
      <Header isLoggedIn={isLoggedIn} onLogout={() => navigate("/")} />
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
            className="student-chart-component"
            variants={itemVariants}
          >
            <motion.div className="chart-header" variants={itemVariants}>
              <h2>
                {view === "course"
                  ? "Student Distribution by Course"
                  : "Gender Distribution of Students"}
              </h2>
              <motion.div
                className="btn-group chart-toggle"
                variants={itemVariants}
              >
                <button
                  onClick={() => setView("course")}
                  className={`btn ${
                    view === "course"
                      ? "btn-primary active"
                      : "btn-outline-primary"
                  }`}
                >
                  Course View
                </button>
                <button
                  onClick={() => setView("gender")}
                  className={`btn ${
                    view === "gender"
                      ? "btn-primary active"
                      : "btn-outline-primary"
                  }`}
                >
                  Gender View
                </button>
              </motion.div>
              <motion.div
                className="btn-group chart-toggle"
                variants={itemVariants}
              >
                <button
                  onClick={() => setChartType("pie")}
                  className={`btn ${
                    chartType === "pie"
                      ? "btn-primary active"
                      : "btn-outline-primary"
                  }`}
                >
                  Pie Chart
                </button>
                <button
                  onClick={() => setChartType("doughnut")}
                  className={`btn ${
                    chartType === "doughnut"
                      ? "btn-primary active"
                      : "btn-outline-primary"
                  }`}
                >
                  Doughnut Chart
                </button>
                <button
                  onClick={() => setChartType("bar")}
                  className={`btn ${
                    chartType === "bar"
                      ? "btn-primary active"
                      : "btn-outline-primary"
                  }`}
                >
                  Bar Chart
                </button>
              </motion.div>
            </motion.div>
            <motion.div className="chart-wrapper" variants={itemVariants}>
              {renderChart()}
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
};

export default StudentCourseGenderChart;
