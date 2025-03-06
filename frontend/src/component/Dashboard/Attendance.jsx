import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AttendanceChart from "./AttendanceChart";
import SideBar from "../SideBar";
import Header from "../Header";

const styles = {
  card: {
    backgroundColor: "#f8f9fa",
    padding: "15px 25px",
    borderRadius: "8px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    minWidth: "140px",
  },
  statLabel: { fontSize: "14px", color: "#666", marginBottom: "5px" },
  statValue: { fontSize: "28px", fontWeight: "bold" },
  chartButton: (isActive) => ({
    padding: "10px 16px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    background: isActive
      ? "linear-gradient(135deg, #008080, #00a3a3)"
      : "#f1f1f1",
    color: isActive ? "#fff" : "#555",
    fontWeight: "500",
    transition: "all 0.2s ease",
    boxShadow: isActive
      ? "0 4px 8px rgba(0, 128, 128, 0.2)"
      : "0 2px 4px rgba(0,0,0,0.05)",
  }),
  container: { display: "flex", flex: 1 },
  sidebar: {
    backgroundColor: "white",
    boxShadow: "2px 0 5px rgba(0,0,0,0.05)",
    width: "240px",
    minHeight: "calc(100vh - 60px)",
  },
  content: { flex: 1, padding: "25px", backgroundColor: "#f8f9fa" },
  cardContainer: { display: "flex", gap: "15px" },
  chartWrapper: {
    background: "#f8f9fa",
    padding: "25px",
    borderRadius: "12px",
    border: "1px solid #eaeaea",
    height: "calc(100% - 200px)",
    boxShadow: "inset 0 1px 3px rgba(0,0,0,0.05)",
    position: "relative",
    overflow: "hidden",
  },
  legend: {
    position: "absolute",
    bottom: "15px",
    left: "15px",
    display: "flex",
    gap: "15px",
  },
  legendItem: { display: "flex", alignItems: "center", gap: "5px" },
  legendColorBox: { width: "12px", height: "12px", borderRadius: "2px" },
};

const Dashboard = () => {
  const [attendanceView, setAttendanceView] = useState("monthly");
  const [attendanceChartType, setAttendanceChartType] = useState("default");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [attendanceStats, setAttendanceStats] = useState({
    presentPercent: 0,
    absentPercent: 0,
    name: 0,
  });

  useEffect(() => {
    const storedData = localStorage.getItem("currentYearData");
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      if (
        parsedData.presentPercent &&
        parsedData.absentPercent &&
        parsedData.name
      ) {
        setAttendanceStats(parsedData);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setIsLoggedIn(false);
    navigate("/"); // Assuming navigate is defined elsewhere
  };

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
      }}
    >
      <Header isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      <div style={styles.container}>
        <div className="sidebar-container">
          <SideBar />
        </div>
        <div style={styles.content}>
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              style={{
                background: "#fff",
                minHeight: "770px",
                padding: "25px",
                borderRadius: "12px",
                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.08)",
                border: "1px solid #eaeaea",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "25px",
                  borderBottom: "2px solid #f0f0f0",
                  paddingBottom: "15px",
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    color: "#008080",
                    fontSize: "24px",
                    fontWeight: "bold",
                    position: "relative",
                    paddingLeft: "15px",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: "5px",
                      backgroundColor: "#FF69B4",
                      borderRadius: "3px",
                    }}
                  ></span>
                  Attendance Analytics
                </h2>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "15px" }}
                >
                  <span
                    style={{
                      color: "#666",
                      fontSize: "14px",
                      fontWeight: "bold",
                    }}
                  >
                    View:
                  </span>
                  <select
                    value={attendanceView}
                    onChange={(e) => setAttendanceView(e.target.value)}
                    style={{
                      padding: "10px 20px",
                      borderRadius: "6px",
                      border: "1px solid #dddddd",
                      backgroundColor: "white",
                      color: "#333",
                      fontSize: "14px",
                      fontWeight: "500",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
                      appearance: "none",
                      backgroundImage:
                        'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23131313%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")',
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 10px top 50%",
                      backgroundSize: "10px auto",
                      paddingRight: "30px",
                    }}
                  >
                    <option value="monthly">Monthly View</option>
                    <option value="yearly">Yearly View</option>
                  </select>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "25px",
                }}
              >
                <div style={styles.cardContainer}>
                  {["Present", "Absent", "Year"].map((label, index) => (
                    <div key={label} style={styles.card}>
                      <span style={styles.statLabel}>{label}</span>
                      <div
                        style={{
                          ...styles.statValue,
                          color:
                            index === 0
                              ? "#008080"
                              : index === 1
                              ? "#FF69B4"
                              : "#666",
                        }}
                      >
                        {index === 0
                          ? attendanceStats.presentPercent
                          : index === 1
                          ? attendanceStats.absentPercent
                          : attendanceStats.name}
                        {index !== 2 && "%"}
                      </div>
                    </div>
                  ))}
                </div>
                <div
                  style={{ display: "flex", gap: "8px", alignItems: "center" }}
                >
                  {["default", "bar", "line", "area"].map((type) => (
                    <button
                      key={type}
                      onClick={() => setAttendanceChartType(type)}
                      style={styles.chartButton(attendanceChartType === type)}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div style={styles.chartWrapper}>
                <div
                  style={{
                    position: "absolute",
                    zIndex: "1000",
                    top: "15px",
                    right: "15px",
                    backgroundColor: "rgba(255,255,255,0.9)",
                    padding: "6px 12px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    color: "#008080",
                    fontWeight: "bold",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                >
                  {attendanceView === "monthly"
                    ? "Monthly Data"
                    : "Yearly Data"}
                </div>
                <AttendanceChart
                  view={attendanceView}
                  chartType={attendanceChartType}
                />
                <div style={styles.legend}>
                  {[
                    { color: "#008080", label: "Present" },
                    { color: "#FF69B4", label: "Absent" },
                  ].map((item) => (
                    <div key={item.label} style={styles.legendItem}>
                      <div
                        style={{
                          ...styles.legendColorBox,
                          backgroundColor: item.color,
                        }}
                      ></div>
                      <span style={{ fontSize: "12px", color: "#666" }}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
