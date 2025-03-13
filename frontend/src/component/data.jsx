import React, { useState, useEffect } from "react";
import styles from "../styles/users.module.css";
import Bill from "./Bills";
import Footer from "../component/Footer";
import Header from "../component/Header";
import { useNavigate, Link } from "react-router-dom";
import { faMicrophone } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function Data() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [yearFilter, setYearFilter] = useState("");
  const [isListening, setIsListening] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setIsLoggedIn(true);
  }, []);

  useEffect(() => {
    if (searchTerm || yearFilter) {
      fetchUsers();
    } else {
      setUsers([]);
      setLoading(false);
    }
  }, [searchTerm, yearFilter, currentPage]);

  const fetchUsers = () => {
    setLoading(true);
    fetch(
      `http://localhost:5000/users?search=${searchTerm}&page=${currentPage}&perPage=5&year=${yearFilter}`
    )
      .then((response) => response.json())
      .then((data) => {
        setUsers(data.users);
        setTotalPages(data.totalPages);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
        setLoading(false);
      });
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleYearChange = (e) => {
    setYearFilter(e.target.value);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const startListening = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    setIsListening(true);
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.continuous = true; // Keep listening
    recognition.interimResults = true; // Show text while speaking
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript; // Update text in real-time
      }

      setSearchTerm(transcript);
      setCurrentPage(1);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setIsLoggedIn(false);
  };

  return (
    <>
      <Header isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      <div className={styles.container}>
        <h1 className={styles.title}>Student List</h1>
        <div className={styles.formContainers}>

          <div className={styles.searchContainer} style={{ position: "relative" }}>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search By Name"
              className={styles.formInput}
              style={{ paddingRight: "40px" }} // Ensures text doesn't overlap with mic button
            />
            <button
              onClick={startListening}
              className={styles.micButton}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "18px",
                color: isListening ? "red" : "#555",
              }}
            >
              <FontAwesomeIcon icon={faMicrophone} />
            </button>
          </div>

          <div className={styles.formContainer}>
            <input
              type="number"
              value={yearFilter}
              onChange={handleYearChange}
              placeholder="Enter Year to Filter"
              className={styles.formInput}
            />
          </div>
        </div>

        {loading ? (
          <p className={styles.loading}>Loading...</p>
        ) : (
          <>
            <table className={styles.userTable}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Course</th>
                  <th>Duration</th>
                  <th>Start Date</th>
                  <th>Generate Bill</th>
                  <th>View Attendance</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.phoneNumber || "No Phone"}</td>
                    <td>{user.courseName || "N/A"}</td>
                    <td>{user.duration || "N/A"}</td>
                    <td>{formatDate(user.admissionDate) || "N/A"}</td>
                    <td>
                      <button className={styles.bill} onClick={() => setSelectedUser(user)}>Bill</button>
                    </td>
                    <td>
                      <Link to={`/attendancedetial/${user.id}`} className={styles.bill}>
                        Attendance
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className={styles.pagination}>
              {Array.from({ length: totalPages }, (_, index) => (
                <button key={index + 1} onClick={() => handlePageChange(index + 1)}>
                  {index + 1}
                </button>
              ))}
            </div>
            {isModalOpen && <Bill isModalOpen={isModalOpen} closeBill={() => setIsModalOpen(false)} selectedUser={selectedUser} />}
          </>
        )}
      </div>
      <Footer />
    </>
  );
}

export default Data;
