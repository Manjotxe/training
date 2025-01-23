import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/Admin.module.css"; // Import the CSS module
import Footer from "../component/Footer";
import Header from "../component/Header";

function Data() {
  const navigate = useNavigate(); // UseNavigate hook to navigate between routes
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [yearFilter, setYearFilter] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);

  const [message, setMessage] = useState("");
  const [link, setLink] = useState("");
  const [file, setFile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // State for controlling modal visibility

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setIsLoggedIn(false);
    navigate("/");
  };

  useEffect(() => {
    fetchUsers();
  }, [searchTerm, currentPage, yearFilter]);

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

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleCheckboxChange = (userId) => {
    setSelectedStudents((prevSelected) => {
      const updatedSelected = prevSelected.includes(userId)
        ? prevSelected.filter((id) => id !== userId)
        : [...prevSelected, userId];
      return updatedSelected;
    });
  };

  const handleSendAssignments = () => {
    const formData = new FormData();
    formData.append("students", JSON.stringify(selectedStudents));
    formData.append("message", message);
    formData.append("link", link);
    formData.append("file", file);

    fetch("http://localhost:5000/upload", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        alert(data.message);
      })
      .catch((error) => {
        console.error("Error sending assignments:", error);
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
          <input
            type="number"
            name="year"
            value={yearFilter}
            onChange={handleYearChange}
            placeholder="Enter Year to Filter"
            className={styles.formInput}
          />
        </div>

        {loading ? (
          <p className={styles.loading}>Loading...</p>
        ) : (
          <>
            <table className={styles.userTable}>
              <thead>
                <tr>
                  <th>Select</th>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone Number</th>
                  <th>Course</th>
                  <th>Duration</th>
                  <th>Started At</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(user.id)}
                        onChange={() => handleCheckboxChange(user.id)}
                      />
                    </td>
                    <td>{user.id}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.phoneNumber || "No Name"}</td>
                    <td>{user.courseName || "null"}</td>
                    <td>{user.duration || "null"}</td>
                    <td>{formatDate(user.admissionDate) || "null"}</td>
                  </tr>
                ))}
              </tbody>
            </table>

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

            <button
              onClick={() => setIsModalOpen(true)}
              className={styles.sendButton}
            >
              Send Assignment
            </button>
          </>
        )}
      </div>

      {isModalOpen && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Send Assignment</h2>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your message here"
              className={styles.formInput}
            />
            <input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="Enter a link"
              className={styles.formInput}
            />
            <input
              type="file"
              onChange={handleFileChange}
              className={styles.formInput}
            />
            <div className={styles.modalActions}>
              <button
                onClick={() => setIsModalOpen(false)}
                className={styles.cancelButton}
              >
                Cancel
              </button>
              <button
                onClick={handleSendAssignments}
                className={styles.sendButton}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer className={styles.footer} />
    </>
  );
}

export default Data;
