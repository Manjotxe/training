import React, { useState, useEffect } from "react";
import "../styles/App.css";
import { Link } from "react-router-dom";
import Header from "./Header"; // Import the Header component
import Footer from "./Footer"; // Import the Footer component
import axios from "axios"; // Import axios for making HTTP requests

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [courses, setCourses] = useState([]); // State to store fetched courses
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    }
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          "http://localhost:5000/api/courses/main"
        );
        setCourses(response.data); // Update the state with fetched courses
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const handleCoursesClick = (e) => {
    const role = localStorage.getItem("role");
    if (!role || role !== "admin") {
      e.preventDefault(); // Prevent the default link behavior
      const coursesSection = document.querySelector(".courses-section");
      if (coursesSection) {
        coursesSection.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const handleCourseClick = (e) => {
    e.preventDefault(); // Prevent default behavior of <Link>

    const coursesSection = document.querySelector(".courses-section");
    if (coursesSection) {
      coursesSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove the token from localStorage
    localStorage.removeItem("role"); // Remove the token from localStorage
    setIsLoggedIn(false); // Update the state to reflect logout
  };

  return (
    <div className="app">
      <Header
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
        handleCoursesClick={handleCoursesClick}
      />
      <main className="main-content">
        <div className="content-wrapper">
          <div className="text-content">
            <h2>Training</h2>
            <h1>YOUR EDUCATION YOUR WAY</h1>
            {/* Conditional rendering for Login/Get Started button */}
            {!isLoggedIn ? (
              <Link to="/login" className="login-btn">
                LOGIN
              </Link>
            ) : (
              <Link className="login-btn" to="#" onClick={handleCourseClick}>
                GET STARTED
              </Link>
            )}
          </div>
        </div>
      </main>
      {/* Courses Section */}
      <section className="courses-section" id="courses">
        <div className="section-header">
          <h2>Our Courses</h2>
          <div className="section-divider"></div>
        </div>
        <div className="courses-wrapper">
          <div className="courses-grid">
            {/* Map over the fetched courses */}
            {isLoading ? (
              <div className="loading-spinner">
                <div className="spinner"></div>
                <p>Loading courses...</p>
              </div>
            ) : courses.length > 0 ? (
              courses.map((course, index) => (
                <div key={index} className="course-card">
                  <div className="course-image-container">
                    <img
                      src={course.image} // Assuming the API provides image URLs
                      alt={course.title}
                      className="course-image"
                    />
                  </div>
                  <div className="course-content">
                    <h3 className="course-title">{course.courseName}</h3>
                    <p className="course-description">{course.languages}</p>
                    <Link
                      to={`/coursedetails/${course.course_id}`}
                      className="course-btn"
                    >
                      Explore Course
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-courses">No courses available at the moment.</p>
            )}
          </div>
        </div>
      </section>
      <Footer /> {/* Use the Footer component */}
    </div>
  );
}

export default App;
