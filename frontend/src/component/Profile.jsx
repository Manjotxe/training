import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "./Header";
import axios from "axios";
import "../styles/profile.css";

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordChangeError, setPasswordChangeError] = useState("");
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/student/${id}`
        );
        setProfile(response.data);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch data");
      }
    };
    fetchProfile();
  }, [id]);
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordChangeError("New password and confirm password do not match.");
      return;
    }
    try {
      const response = await axios.put(
        `http://localhost:5000/api/student/${id}/password`,
        {
          oldPassword,
          newPassword,
        }
      );
      setPasswordChangeSuccess(response.data.message);
      setPasswordChangeError("");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordChangeError(
        err.response?.data?.error || "Failed to change password."
      );
    }
  };

  // Helper function to format dates nicely
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
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
    navigate("/");
  };

  if (error) {
    return <div className="text-center mt-5 text-danger">Error: {error}</div>;
  }

  if (!profile) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card shadow-lg border-0">
              {/* Header Section with Background */}
              <div className="p-4" style={{ backgroundColor: "#005666" }}>
                <div className="text-center">
                  <img
                    src={profile.photo}
                    alt="Student"
                    className="rounded-circle mb-3"
                    style={{
                      width: "180px",
                      height: "180px",
                      objectFit: "cover",
                      border: "4px solid white",
                      boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                    }}
                  />
                  <h2 className="text-white mb-0">{profile.student_name}</h2>
                </div>
              </div>

              {/* Contact Information Bar */}
              <div className="bg-light p-3 text-center border-bottom">
                <div className="row">
                  <div className="col-md-6">
                    <i
                      className="bi bi-envelope me-2"
                      style={{ color: "#ff69b4" }}
                    ></i>
                    <b>Email : </b>
                    {profile.email}
                  </div>
                  <div className="col-md-6">
                    <i
                      className="bi bi-telephone me-2"
                      style={{ color: "#ff69b4" }}
                    ></i>
                    <b>Phone no. : </b>
                    {profile.phoneNumber}
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="card-body p-4">
                {/* Personal Information Section */}
                <div className="mb-4">
                  <h4
                    className="mb-3"
                    style={{
                      color: "#005666",
                      borderBottom: "2px solid #ff69b4",
                      paddingBottom: "8px",
                    }}
                  >
                    Personal Information
                  </h4>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="p-3 bg-light rounded">
                        <strong>Father's Name:</strong>
                        <p className="mb-0 mt-1">{profile.fatherName}</p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="p-3 bg-light rounded">
                        <strong>Date of Birth:</strong>
                        <p className="mb-0 mt-1">{formatDate(profile.dob)}</p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="p-3 bg-light rounded">
                        <strong>Admission Date:</strong>
                        <p className="mb-0 mt-1">{formatDate(profile.dob)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Course Details Section */}
                <div>
                  <h4
                    className="mb-3"
                    style={{
                      color: "#005666",
                      borderBottom: "2px solid #ff69b4",
                      paddingBottom: "8px",
                    }}
                  >
                    Course Details
                  </h4>
                  <div className="bg-light p-4 rounded">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <strong>Course Name:</strong>
                        <p className="mb-2">{profile.name}</p>
                      </div>
                      <div className="col-md-6">
                        <strong>Duration:</strong>
                        <p className="mb-2">{profile.duration} </p>
                      </div>
                      <div className="col-12">
                        <strong>Description:</strong>
                        <p className="mb-0">{profile.languages}</p>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Add password change section */}
                <div className="mt-4">
                  <h4
                    className="mb-3"
                    style={{
                      color: "#005666",
                      borderBottom: "2px solid #ff69b4",
                      paddingBottom: "8px",
                    }}
                  >
                    Change Password
                  </h4>
                  <form onSubmit={handlePasswordChange}>
                    <div className="mb-3">
                      <label className="form-label">Old Password</label>
                      <input
                        type="password"
                        className="form-control"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">New Password</label>
                      <input
                        type="password"
                        className="form-control"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Confirm New Password</label>
                      <input
                        type="password"
                        className="form-control"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                    {passwordChangeError && (
                      <div className="text-danger mb-3">
                        {passwordChangeError}
                      </div>
                    )}
                    {passwordChangeSuccess && (
                      <div className="text-success mb-3">
                        {passwordChangeSuccess}
                      </div>
                    )}
                    <button type="submit" className="btn btn-primary">
                      Change Password
                    </button>
                  </form>
                </div>

                {/* Logout Button */}
                <div className="mt-4 text-center">
                  <button className="btn btn-danger" onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              </div>

              <div
                className="card-footer text-center py-3"
                style={{ backgroundColor: "#f8f9fa" }}
              >
                <small className="text-muted">Student ID: {id}</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
