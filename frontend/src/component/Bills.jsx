import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "../styles/Bills.module.css"; // Import the CSS module
import { useNavigate } from "react-router-dom";

function BillForm({ closeBill, isModalOpen, selectedUser }) {
  // Helper function to get today's date in 'YYYY-MM-DD' format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0]; // Format date to 'YYYY-MM-DD'
  };
  const [name, setName] = useState(selectedUser?.name || "");
  const [email, setEmail] = useState(selectedUser?.email || "");
  const [courseName, setCourseName] = useState("");
  const [rupees, setRupees] = useState("");
  const [date, setDate] = useState(getTodayDate());
  const [prevdate, setPrevdate] = useState("");
  const navigate = useNavigate(); // Initialize navigate

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString(); // Formats as MM/DD/YYYY or use your custom format
  };

  const fetchCourses = async () => {
    try {
      console.log(email);
      const response = await axios.get(
        "http://localhost:5000/api/fetchdetails",
        {
          params: { email }, // Send email as query parameter
        }
      );
      const data = response.data;
      console.log("Fetched Course Data:", data);
      setCourseName(data.courseName);
      setPrevdate(data.date);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  useEffect(() => {
    if (email) {
      fetchCourses()
        .then(() => console.log("Courses fetched successfully"))
        .catch((err) => console.error("Error:", err));
    }
  }, [email]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const billData = { name, email, courseName, rupees, date };

    try {
      const response = await axios.post(
        "http://localhost:5000/api/bill",
        billData
      );
      alert("Bill created successfully!");
      closeBill(); // Close modal after successful submission
      navigate("/"); // Navigate to home page
    } catch (error) {
      alert("Error creating bill");
    }
  };

  return (
    <div>
      {/* Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <span className={styles.closeButton} onClick={closeBill}>
              &times;
            </span>
            <h1>Create Bill</h1>
            <form onSubmit={handleSubmit}>
              <div className={styles.formField}>
                <label>Name: </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className={styles.formField}>
                <label>Email: </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className={styles.formField}>
                <label>Course Name: </label>
                <input
                  type="text"
                  value={courseName}
                  readOnly
                  placeholder="Course will auto-fill based on email"
                />
              </div>
              <div className={styles.formField}>
                <label>Last payment: </label>
                <input
                  type="text"
                  value={prevdate ? formatDate(prevdate) : ""}
                  readOnly
                  placeholder="Course will auto-fill based on email"
                />
              </div>
              <div className={styles.formField}>
                <label>Rupees: </label>
                <input
                  type="number"
                  value={rupees}
                  onChange={(e) => setRupees(e.target.value)}
                  required
                />
              </div>
              <div className={styles.formField}>
                <label>Date: </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              <button className={styles.submitButton} type="submit">
                Generate Bill
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default BillForm;
