import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "./Header";
import Footer from "./Footer";
import styles from "../styles/course.module.css";

const CourseManagement = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false); // State to toggle modal visibility
  const [newCourse, setNewCourse] = useState({
    courseName: "",
    duration: "",
    languages: "",
  });

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

  // Fetch courses from backend
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(
          "https://training-1qal.onrender.com/api/courses"
        );
        setCourses(response.data);
      } catch (err) {
        console.error("Error fetching courses:", err);
        setError("Failed to load courses. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Handle input change for new course
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCourse((prev) => ({ ...prev, [name]: value }));
  };

  // Submit new course to backend
  const handleAddCourse = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5000/api/courses",
        newCourse
      );
      setCourses((prev) => [...prev, response.data]); // Update courses list
      setNewCourse({ courseName: "", duration: "", languages: "" }); // Reset form
      setShowModal(false); // Hide modal
    } catch (err) {
      console.error("Error adding course:", err);
      setError("Failed to add course. Please try again.");
    }
  };

  if (loading) {
    return <div className={styles.loader}>Loading courses...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <>
      <Header isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      <div
        className={`${styles.courseManagementContainers} ${
          showModal ? styles.bodyBlur : ""
        }`}
      >
        <main className="container mx-auto px-4 py-12 flex-grow">
          <div className="text-center mb-12">
            <h1 className={styles.courseHeader}>Available Courses</h1>
            <button
              className={styles.addCourseButton}
              onClick={() => setShowModal(true)}
            >
              Add Course
            </button>
          </div>

          <div className={styles.grid}>
            {courses.map((course) => (
              <div key={course.course_id} className={styles.card}>
                <div className={styles.highlightLine}></div>
                <div className="p-6">
                  <h3 className={styles.cardHeader}>{course.courseName}</h3>
                  <div className="space-y-3">
                    <div className={styles.cardDetails}>
                      <p>
                        <span>Duration:</span> {course.duration}
                      </p>
                    </div>
                    <div className={styles.cardDetails}>
                      <p>
                        <span>Languages:</span> {course.languages}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      <Footer />

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2 className={styles.modalHeader}>Add New Course</h2>
            <form onSubmit={handleAddCourse}>
              <div className={styles.formGroup}>
                <label htmlFor="courseName">Course Name</label>
                <input
                  type="text"
                  id="courseName"
                  name="courseName"
                  value={newCourse.courseName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="duration">Duration</label>
                <input
                  type="text"
                  id="duration"
                  name="duration"
                  value={newCourse.duration}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="languages">Languages</label>
                <input
                  type="text"
                  id="languages"
                  name="languages"
                  value={newCourse.languages}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => setShowModal(false)} // Hide modal
                >
                  Cancel
                </button>
                <button type="submit" className={styles.submitButton}>
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default CourseManagement;
