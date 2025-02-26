import React from "react";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-qualities">
          <div className="quality-box">
            <div className="quality-icon">
              <i className="fa-solid fa-certificate"></i>
            </div>
            <h3>Registered Trademark</h3>
            <p>
              Our institution is a proud registered trademark, recognized for
              excellence.
            </p>
          </div>
          <div className="quality-box">
            <div className="quality-icon">
              <i className="fa-solid fa-check-circle"></i>
            </div>
            <h3>ISO Certified</h3>
            <p>
              We adhere to international standards with our ISO certification.
            </p>
          </div>
          <div className="quality-box">
            <div className="quality-icon">
              <i className="fa-solid fa-globe"></i>
            </div>
            <h3>Internationally Approved</h3>
            <p>Our programs and certifications are recognized globally.</p>
          </div>
        </div>
      </div>

      <div className="footer-main">
        <div className="footer-tabs">
          <div className="footer-column">
            <h3>Quick Links</h3>
            <ul>
              <li>
                <a href="#">
                  <i className="fa-solid fa-angle-right"></i> About Us
                </a>
              </li>
              <li>
                <a href="#">
                  <i className="fa-solid fa-angle-right"></i> Vision & Mission
                </a>
              </li>
              <li>
                <a href="#">
                  <i className="fa-solid fa-angle-right"></i> Leadership
                </a>
              </li>
              <li>
                <a href="#">
                  <i className="fa-solid fa-angle-right"></i> Recognition
                </a>
              </li>
              <li>
                <a href="#">
                  <i className="fa-solid fa-angle-right"></i> Infrastructure
                </a>
              </li>
            </ul>
          </div>

          <div className="footer-column">
            <h3>Admissions</h3>
            <ul>
              <li>
                <a href="#">
                  <i className="fa-solid fa-angle-right"></i> How to Apply
                </a>
              </li>
              <li>
                <a href="#">
                  <i className="fa-solid fa-angle-right"></i> Admission Process
                </a>
              </li>
              <li>
                <a href="#">
                  <i className="fa-solid fa-angle-right"></i> Programs
                </a>
              </li>
              <li>
                <a href="#">
                  <i className="fa-solid fa-angle-right"></i> Fee Structure
                </a>
              </li>
            </ul>
          </div>

          <div className="footer-column">
            <h3>Student Corner</h3>
            <ul>
              <li>
                <a href="#">
                  <i className="fa-solid fa-angle-right"></i> Student Login
                </a>
              </li>
              <li>
                <a href="#">
                  <i className="fa-solid fa-angle-right"></i> Study Material
                </a>
              </li>
              <li>
                <a href="#">
                  <i className="fa-solid fa-angle-right"></i> Assignment
                </a>
              </li>
              <li>
                <a href="#">
                  <i className="fa-solid fa-angle-right"></i> Time Table
                </a>
              </li>
            </ul>
          </div>

          <div className="footer-column">
            <h3>Contact Us</h3>
            <ul className="contact-info">
              <li>
                <i className="fa-solid fa-location-dot"></i>
                <span>123 Education Street, Knowledge City</span>
              </li>
              <li>
                <i className="fa-solid fa-phone"></i>
                <span>+91-1824-521350</span>
              </li>
              <li>
                <i className="fa-solid fa-envelope"></i>
                <span>info@traininginstitute.com</span>
              </li>
            </ul>
            <div className="footer-social">
              <a href="#" className="social-icon facebook">
                <i className="fa-brands fa-facebook-f"></i>
              </a>
              <a href="#" className="social-icon instagram">
                <i className="fa-brands fa-instagram"></i>
              </a>
              <a href="#" className="social-icon linkedin">
                <i className="fa-brands fa-linkedin-in"></i>
              </a>
              <a href="#" className="social-icon youtube">
                <i className="fa-brands fa-youtube"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>
          &copy; {new Date().getFullYear()} Training Institute. All Rights
          Reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
