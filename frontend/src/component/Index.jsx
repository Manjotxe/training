import React, { useState, useEffect } from "react";
import "../styles/App.css";
import { Link } from "react-router-dom";
import Header from "./Header"; // Import the Header component
import Footer from "./Footer"; // Import the Footer component

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove the token from localStorage
    localStorage.removeItem("role"); // Remove the token from localStorage
    setIsLoggedIn(false); // Update the state to reflect logout
  };

  return (
    <div className="app">
      <Header isLoggedIn={isLoggedIn} onLogout={handleLogout} /> {/* Pass props to Header */}
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
              <Link to="/get-started" className="login-btn">
                GET STARTED
              </Link>
            )}
          </div>
        </div>
      </main>
      {/* Courses Section */}
      <section className="courses-section">
        <div className="courses-wrapper">
          <h2>Our Courses</h2>
          <div className="courses-grid">
            {[
              {
                title: "Web Development",
                description: "Learn HTML, CSS, JavaScript, and modern frameworks to build responsive websites.",
                image: "https://clipart-library.com/image_gallery2/Web-Development-PNG-File.png",
              },
              {
                title: "Data Science",
                description: "Master Python, machine learning, and data visualization techniques.",
                image: "https://www.springboard.com/library/static/b2cd05116fc1151aae9af49289bb8520/c1b63/10-12-how-is-data-science-used-in-finance.png",
              },
              {
                title: "Graphic Design",
                description: "Explore creative tools like Photoshop, Illustrator, and Figma.",
                image: "https://png.pngtree.com/png-vector/20240607/ourmid/pngtree-a-graphic-designer-man-work-on-laptop-png-image_12650928.png",
              },
              {
                title: "Digital Marketing",
                description: "Learn SEO, SEM, and social media strategies to grow your brand.",
                image: "https://mitsde.com/assets/images/course/digital/post-graduate-cetificate-in-digital-marketing.png",
              },
            ].map((course, index) => (
              <div key={index} className="course-card">
                <img src={course.image} alt={course.title} className="course-image" />
                <h3 className="course-title">{course.title}</h3>
                <p className="course-description">{course.description}</p>
                <Link to="/courses" className="course-btn">
                  Explore Course
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer /> {/* Use the Footer component */}
    </div>
  );
}

export default App;
