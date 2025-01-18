import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../styles/Bills.module.css'; // Import the CSS module
import { useNavigate } from 'react-router-dom';

function BillForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [courseName, setCourseName] = useState('');
  const [rupees, setRupees] = useState('');
  const [date, setDate] = useState('');
  const [prevdate, setPrevdate] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(true); // Track if modal is open
  const navigate = useNavigate(); // Initialize navigate

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString(); // Formats as MM/DD/YYYY or use your custom format
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/courses?email=${email}`);
      const data = await response.json();
      console.log('Fetched Course Data:', data);
      setCourseName(data.courseName);
      setPrevdate(data.date);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };
  

  useEffect(() => {
    if (email) {
      fetchCourses(email); // Fetch course name when email changes
    }
  }, [email]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const billData = { name, email, courseName, rupees, date };

    try {
      const response = await axios.post('http://localhost:5000/api/bill', billData);
      alert('Bill created successfully!');
      setIsModalOpen(false); // Close modal after successful submission
      navigate('/'); // Navigate to home page
    } catch (error) {
      alert('Error creating bill');
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    navigate('/'); // Navigate to home page
  };

  return (
    <div>
      {/* Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <span className={styles.closeButton} onClick={closeModal}>
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
                  value={prevdate?formatDate(prevdate):null}
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
              <button className={styles.submitButton} type="submit">Generate Bill</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default BillForm;
