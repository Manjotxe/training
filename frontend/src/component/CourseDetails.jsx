import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../styles/CourseDetails.css";
import Header from "./Header";

function CourseDetails() {
  const { course_id } = useParams(); // Get course_id from URL
  const [courseData, setCourseData] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/coursebyid/${course_id}`)
      .then((response) => {
        setCourseData(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching course details:", error);
        setLoading(false);
      });
  }, [course_id]);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  //logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setIsLoggedIn(false);
    navigate("/");
  };

  if (loading) return <p>Loading course details...</p>;
  if (!courseData) return <p>No course found.</p>;

  return (
    <>
      <Header isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      <div className="course-container">
        <div className="course-header">
          <h1>{courseData.courseName}</h1>
          <div className="rating">★ {courseData.rating || "4.8"}</div>
        </div>

        <div className="course-grid">
          <div className="course-info-card">
            <h2>Course Overview</h2>
            <p>{courseData.description || "No description available."}</p>
          </div>

          <div className="course-details-card">
            <div className="detail-item">
              <span className="label">Duration:</span>
              <span className="value">{courseData.duration}</span>
            </div>
            <div className="detail-item">
              <span className="label">Price:</span>
              <span className="value">
                {courseData.price ? `$${courseData.price}` : "Free"}
              </span>
            </div>
            <div className="detail-item">
              <span className="label">Instructor:</span>
              <span className="value">
                {courseData.instructor || "Not specified"}
              </span>
            </div>
            <div className="detail-item">
              <span className="label">Schedule:</span>
              <span className="value">
                {courseData.schedule || "Not available"}
              </span>
            </div>
            <div className="detail-item">
              <span className="label">Level:</span>
              <span className="value">{courseData.level || "Not defined"}</span>
            </div>
          </div>

          <div className="topics-card">
            <h2>What You'll Learn</h2>
            <ul>
              {courseData.languages
                ?.split(",")
                .map((topic, index) => <li key={index}>{topic.trim()}</li>) || (
                <li>No topics available</li>
              )}
            </ul>
          </div>

          <div className="enroll-card">
            <div className="price-tag">
              {courseData.price ? `$${courseData.price}` : "Free"}
            </div>
            <button className="enroll-button">Enroll Now</button>
            <p className="guarantee">30-day money-back guarantee</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default CourseDetails;
