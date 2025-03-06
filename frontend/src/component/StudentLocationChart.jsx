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

// Register Chart.js components
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);
const StudentLocationChart = () => {
  const [locationData, setLocationData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [chartType, setChartType] = useState("pie");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "http://localhost:5000/students/location"
        );
        setLocationData(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch student location data");
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
    const locations = locationData.map((item) => item.location);
    const counts = locationData.map((item) => item.student_count);

    // Generate colors dynamically based on the number of locations
    const backgroundColors = locations.map((_, index) => {
      // Create colors between the two gradients you specified
      const r = Math.floor(255 - index * (255 / locations.length));
      const g = Math.floor(109 - index * (109 / locations.length));
      const b = Math.floor(180 - index * (180 / locations.length));
      return `rgba(${r}, ${g}, ${b}, 0.8)`;
    });

    return {
      labels: locations,
      datasets: [
        {
          data: counts,
          backgroundColor: backgroundColors,
          borderColor: backgroundColors.map((color) =>
            color.replace("0.8", "1")
          ),
          borderWidth: 1,
        },
      ],
    };
  };

  const chartOptions = {
    plugins: {
      legend: {
        position: "right",
        labels: {
          font: {
            family: "'Poppins', sans-serif",
            size: 14,
          },
          color: "#333",
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || "";
            const value = context.raw || 0;
            const total = context.dataset.data.reduce(
              (acc, curr) => acc + curr,
              0
            );
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} students (${percentage}%)`;
          },
        },
      },
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
        return (
          <Bar
            data={data}
            options={{
              ...chartOptions,
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: "Number of Students",
                    font: {
                      family: "'Poppins', sans-serif",
                      size: 14,
                    },
                  },
                },
                x: {
                  title: {
                    display: true,
                    text: "Location",
                    font: {
                      family: "'Poppins', sans-serif",
                      size: 14,
                    },
                  },
                },
              },
            }}
          />
        );
      default:
        return <Pie data={data} options={chartOptions} />;
    }
  };

  if (loading) {
    return (
      <div className="chart-container loading-container">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chart-container error-container">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setIsLoggedIn(false);
    navigate("/");
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
            className="student-chart-component"
            variants={itemVariants}
          >
            <motion.div className="chart-header" variants={itemVariants}>
              <h2>Student Distribution by Location</h2>
              <div className="btn-group chart-toggle" role="group">
                <button
                  type="button"
                  className={`btn ${
                    chartType === "pie"
                      ? "btn-primary active"
                      : "btn-outline-primary"
                  }`}
                  onClick={() => setChartType("pie")}
                >
                  Pie Chart
                </button>
                <button
                  type="button"
                  className={`btn ${
                    chartType === "doughnut"
                      ? "btn-primary active"
                      : "btn-outline-primary"
                  }`}
                  onClick={() => setChartType("doughnut")}
                >
                  Doughnut Chart
                </button>
                <button
                  type="button"
                  className={`btn ${
                    chartType === "bar"
                      ? "btn-primary active"
                      : "btn-outline-primary"
                  }`}
                  onClick={() => setChartType("bar")}
                >
                  Bar Chart
                </button>
              </div>
            </motion.div>

            <motion.div className="chart-wrapper" variants={itemVariants}>
              {renderChart()}
            </motion.div>

            <motion.div className="stats-summary" variants={itemVariants}>
              <div className="row">
                <div className="col-md-4">
                  <motion.div className="stats-card" variants={itemVariants}>
                    <h3>Total Students</h3>
                    <p>
                      {locationData.reduce(
                        (acc, curr) => acc + curr.student_count,
                        0
                      )}
                    </p>
                  </motion.div>
                </div>
                <div className="col-md-4">
                  <motion.div className="stats-card" variants={itemVariants}>
                    <h3>Locations</h3>
                    <p>{locationData.length}</p>
                  </motion.div>
                </div>
                <div className="col-md-4">
                  <motion.div className="stats-card" variants={itemVariants}>
                    <h3>Top Location</h3>
                    <p>
                      {locationData.sort(
                        (a, b) => b.student_count - a.student_count
                      )[0]?.location || "N/A"}
                    </p>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
};

export default StudentLocationChart;
