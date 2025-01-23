// src/components/Footer.js
import React from "react";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-qualities">
        <div className="quality-box">
          <h3>Registered Trademark</h3>
          <p>
            Our institution is a proud registered trademark, recognized for
            excellence.
          </p>
        </div>
        <div className="quality-box">
          <h3>ISO Certified</h3>
          <p>
            We adhere to international standards with our ISO certification.
          </p>
        </div>
        <div className="quality-box">
          <h3>Internationally Approved</h3>
          <p>Our programs and certifications are recognized globally.</p>
        </div>
      </div>

      <div className="footer-tabs">
        <div className="footer-column">
          <h3>Quick Links</h3>
          <ul>
            <li>
              <a href="#">About Us</a>
            </li>
            <li>
              <a href="#">Vision & Mission</a>
            </li>
            <li>
              <a href="#">Leadership</a>
            </li>
            <li>
              <a href="#">Recognition</a>
            </li>
            <li>
              <a href="#">Infrastructure</a>
            </li>
          </ul>
        </div>

        <div className="footer-column">
          <h3>Admissions</h3>
          <ul>
            <li>
              <a href="#">How to Apply</a>
            </li>
            <li>
              <a href="#">Admission Process</a>
            </li>
            <li>
              <a href="#">Programs</a>
            </li>
            <li>
              <a href="#">Fee Structure</a>
            </li>
          </ul>
        </div>

        <div className="footer-column">
          <h3>Student Corner</h3>
          <ul>
            <li>
              <a href="#">Student Login</a>
            </li>
            <li>
              <a href="#">Study Material</a>
            </li>
            <li>
              <a href="#">Assignment</a>
            </li>
            <li>
              <a href="#">Time Table</a>
            </li>
          </ul>
        </div>

        <div className="footer-column">
          <h3>Contact Us</h3>
          <ul>
            <li>
              <a href="#">Get in Touch</a>
            </li>
            <li>
              <a href="#">Institution Location</a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
