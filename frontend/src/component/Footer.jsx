// src/components/Footer.js
import React from 'react';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-icons">
        <div className="icon-box">
          <div className="icon direction"></div>
        </div>
        <div className="icon-box">
          <div className="icon graph"></div>
        </div>
        <div className="icon-box">
          <div className="icon stack"></div>
        </div>
        <div className="icon-box">
          <div className="icon clock"></div>
        </div>
      </div>
      
      <div className="footer-tabs">
        <div className="footer-column">
          <h3>Quick Links</h3>
          <ul>
            <li><a href="#">About Us</a></li>
            <li><a href="#">Vision & Mission</a></li>
            <li><a href="#">Leadership</a></li>
            <li><a href="#">Recognition</a></li>
            <li><a href="#">Infrastructure</a></li>
          </ul>
        </div>
        
        <div className="footer-column">
          <h3>Admissions</h3>
          <ul>
            <li><a href="#">How to Apply</a></li>
            <li><a href="#">Admission Process</a></li>
            <li><a href="#">Programs</a></li>
            <li><a href="#">Fee Structure</a></li>
            <li><a href="#">Scholarships</a></li>
          </ul>
        </div>
        
        <div className="footer-column">
          <h3>Student Corner</h3>
          <ul>
            <li><a href="#">Student Login</a></li>
            <li><a href="#">Study Material</a></li>
            <li><a href="#">Assignment</a></li>
            <li><a href="#">Time Table</a></li>
            <li><a href="#">Results</a></li>
          </ul>
        </div>
        
        <div className="footer-column">
          <h3>Contact Us</h3>
          <ul>
            <li><a href="#">Get in Touch</a></li>
            <li><a href="#">Campus Location</a></li>
            <li><a href="#">Support Center</a></li>
            <li><a href="#">Grievance</a></li>
            <li><a href="#">FAQs</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
