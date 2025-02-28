import React, { useState, useEffect } from "react";
import styles from "../styles/users.module.css"; // Import the CSS module
import Bill from "./Bills";
import Footer from "../component/Footer";
import Header from "../component/Header";
import { useNavigate, Link } from "react-router-dom";

function Data() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [yearFilter, setYearFilter] = useState(""); // Add state for year filter
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);
  const handleBill = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };
  const handleCloseBill = () => {
    setIsModalOpen(false);
  };
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setIsLoggedIn(false);
  };

  useEffect(() => {
    setLoading(false);
    if (searchTerm || yearFilter) {
      fetchUsers();
    } else {
      setUsers([]); // Clear the user list if no search term or year filter
    }
  }, [searchTerm, yearFilter, currentPage]);

  const fetchUsers = () => {
    setLoading(true);
    // Send yearFilter along with searchTerm, currentPage, and perPage
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
    setCurrentPage(1); // Reset to the first page when search changes
  };

  const handleYearChange = (e) => {
    setYearFilter(e.target.value); // Update the year filter
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };
  const viewAttendance = () => {
    navigate("/attendance");
  };
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <>
      <Header isLoggedIn={isLoggedIn} onLogout={handleLogout} />

      <div className={styles.container}>
        <h1 className={styles.title}>Student List</h1>
        <div className={styles.formContainers}>
          <input
            type="text"
            name="search"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search By Name"
            className={styles.formInput}
          />

          {/* Add the input for year filter */}
          <div className={styles.formContainer}>
            <input
              type="number"
              name="year"
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
                  <th>Phone Number</th>
                  <th>Course</th>
                  <th>Duration</th>
                  <th>Started At</th>
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
                    <td>{user.phoneNumber || "No Name"}</td>
                    <td>{user.courseName || "null"}</td>
                    <td>{user.duration || "null"}</td>
                    <td>{formatDate(user.admissionDate) || "null"}</td>
                    <td>
                      <button
                        className={styles.bill}
                        onClick={() => handleBill(user)}
                      >
                        Bill
                      </button>
                    </td>
                    <td>
                      <Link
                        to={`/attendancedetial/${user.id}`}
                        className={styles.bill}
                        style={{ textDecoration: "none" }}
                      >
                        Attendance
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {searchTerm || yearFilter ? (
              <div className={styles.pagination}>
                {Array.from({ length: totalPages }, (_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => handlePageChange(index + 1)}
                    disabled={currentPage === index + 1}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            ) : (
              ""
            )}
            {isModalOpen && (
              <Bill
                isModalOpen={isModalOpen}
                closeBill={handleCloseBill}
                selectedUser={selectedUser}
              />
            )}
          </>
        )}
      </div>

      <Footer className={styles.footer} />
    </>
  );
}

export default Data;
