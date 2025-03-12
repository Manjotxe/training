import { useState, useEffect, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Header from "./Header";
import "../styles/AdmissionForm.css";

function AdmissionForm() {
  // Helper function to get today's date in 'YYYY-MM-DD' format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0]; // Format date to 'YYYY-MM-DD'
  };
  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    fatherName: "",
    motherName: "",
    profession: "",
    nationality: "",
    maritalStatus: "",
    sex: "",
    address: "",
    city: "",
    pinCode: "",
    phoneNumber: "",
    email: "",
    schoolX: "",
    schoolXII: "",
    courseName: "",
    admissionDate: getTodayDate(),
  });
  const [courses, setCourses] = useState([]);
  const [signature, setSignature] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [photo, setPhoto] = useState(null);
  const sigPad = useRef(null);
  const fileInputRef = useRef(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  // New state for camera preview
  const [showCameraPreview, setShowCameraPreview] = useState(false);
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  //logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setIsLoggedIn(false);
    navigate("/");
  };
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/courses");
        const data = await response.json();
        setCourses(data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    fetchCourses();
  }, []);

  // Clean up camera stream when component unmounts or preview closes
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Updated to open camera in preview mode
  const handleCapturePhoto = async () => {
    try {
      const videoStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      setStream(videoStream);
      setShowCameraPreview(true);

      // Wait for the modal to be shown before attaching stream to video
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = videoStream;
        }
      }, 100);
    } catch (error) {
      console.error("Error accessing camera:", error);
      Swal.fire({
        icon: "error",
        title: "Camera Error",
        text: "Unable to access your camera. Please check permissions.",
      });
    }
  };

  // New function to take the actual photo from preview
  const takePicture = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext("2d").drawImage(videoRef.current, 0, 0);
      const photoUrl = canvas.toDataURL("image/jpeg");
      setPhoto(photoUrl);

      // Clean up
      closeCameraPreview();
    }
  };

  // Close preview and stop camera
  const closeCameraPreview = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setShowCameraPreview(false);
  };

  const clearSignature = () => {
    sigPad.current.clear();
    setSignature(null);
    setIsSaved(false); // Enable the save button and unlock the canvas
  };

  const saveSignature = () => {
    if (sigPad.current) {
      setSignature(sigPad.current.toDataURL());
      setIsSaved(true); // Disable save button and lock the canvas
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic form validation
    if (!signature) {
      Swal.fire({
        icon: "warning",
        title: "Signature Required",
        text: "Please sign the form before submitting.",
      });
      return;
    }

    if (!photo) {
      Swal.fire({
        icon: "warning",
        title: "Photo Required",
        text: "Please upload or capture a photo before submitting.",
      });
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/admissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ ...formData, signature, photo }),
      });

      const result = await response.json();
      if (response.ok) {
        // Form submitted successfully, now create a Google Sheet
        const sheetName = formData.name; // Create a unique sheet name

        try {
          const sheetResponse = await fetch(
            "http://localhost:5000/googlesheets/create-sheet",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ sheetName }),
            }
          );

          const sheetData = await sheetResponse.json();
          if (sheetData.success) {
            Swal.fire({
              icon: "success",
              title: "Success!",
              text: "Your application has been submitted and a new sheet has been created!",
              confirmButtonColor: "var(--pink-primary)",
            }).then(() => {
              navigate("/"); // Navigate after alert closes
            });
          } else {
            Swal.fire("Error", "Failed to create the Google Sheet", "error");
          }
        } catch (sheetError) {
          console.error("Error creating Google Sheet:", sheetError);
          Swal.fire(
            "Error",
            "Something went wrong while creating the sheet!",
            "error"
          );
        }
      } else {
        // Form submission failed
        Swal.fire({
          icon: "error",
          title: "Error",
          text: result.error || "Something went wrong. Please try again.",
          confirmButtonColor: "var(--pink-primary)",
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An unexpected error occurred. Please try again later.",
        confirmButtonColor: "var(--pink-primary)",
      });
    }
  };

  // Check if user is logged in
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire({
          icon: "warning",
          title: "Authentication Required",
          text: "Please log in to access the admission form.",
          confirmButtonColor: "var(--pink-primary)",
        }).then(() => {
          navigate("/login");
        });
      }
    };

    checkAuth();
  }, [navigate]);

  return (
    <>
      <Header isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10">
            <div className="card shadow-lg">
              <div className="card-body p-4 p-md-5">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h1>Admission Form</h1>
                  <div className="d-flex align-items-center">
                    {photo ? (
                      <div className="photo-preview">
                        <img
                          src={photo}
                          alt="Applicant"
                          className="uploaded-photo"
                        />
                      </div>
                    ) : (
                      <div className="photo-preview d-flex justify-content-center align-items-center bg-light">
                        <span className="text-muted">No Photo</span>
                      </div>
                    )}
                  </div>
                </div>

                <form onSubmit={handleSubmit}>
                  {/* Personal Information Section */}
                  <div className="mb-4">
                    <h5
                      className="mb-3"
                      style={{
                        color: "var(--pink-primary)",
                        borderBottom: "1px solid var(--pink-light)",
                        paddingBottom: "8px",
                      }}
                    >
                      Personal Information
                    </h5>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="name" className="form-label">
                          Full Name
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Enter your full name"
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label htmlFor="dob" className="form-label">
                          Date of Birth
                        </label>
                        <input
                          type="date"
                          className="form-control"
                          id="dob"
                          name="dob"
                          value={formData.dob}
                          onChange={handleChange}
                          max={getTodayDate()} // Restricts selection to past dates only
                          required
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="fatherName" className="form-label">
                          Father's Name
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="fatherName"
                          name="fatherName"
                          placeholder="Enter father's name"
                          value={formData.fatherName}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label htmlFor="motherName" className="form-label">
                          Mother's Name
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="motherName"
                          name="motherName"
                          placeholder="Enter mother's name"
                          value={formData.motherName}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="profession" className="form-label">
                          Profession
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="profession"
                          name="profession"
                          placeholder="Your current profession"
                          value={formData.profession}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label htmlFor="nationality" className="form-label">
                          Nationality
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="nationality"
                          name="nationality"
                          placeholder="Your nationality"
                          value={formData.nationality}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="maritalStatus" className="form-label">
                          Marital Status
                        </label>
                        <select
                          className="form-select"
                          id="maritalStatus"
                          name="maritalStatus"
                          value={formData.maritalStatus}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select Status</option>
                          <option value="single">Single</option>
                          <option value="married">Married</option>
                        </select>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label htmlFor="sex" className="form-label">
                          Sex
                        </label>
                        <select
                          className="form-select"
                          id="sex"
                          name="sex"
                          value={formData.sex}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select Sex</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information Section */}
                  <div className="mb-4">
                    <h5
                      className="mb-3"
                      style={{
                        color: "var(--pink-primary)",
                        borderBottom: "1px solid var(--pink-light)",
                        paddingBottom: "8px",
                      }}
                    >
                      Contact Information
                    </h5>
                    <div className="mb-3">
                      <label htmlFor="address" className="form-label">
                        Address
                      </label>
                      <textarea
                        className="form-control"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Enter your complete address"
                        rows="3"
                        required
                      />
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="city" className="form-label">
                          City
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="city"
                          name="city"
                          placeholder="Your city"
                          value={formData.city}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label htmlFor="pinCode" className="form-label">
                          Pin Code
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="pinCode"
                          name="pinCode"
                          placeholder="Your area pin code"
                          value={formData.pinCode}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="phoneNumber" className="form-label">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          className="form-control"
                          id="phoneNumber"
                          name="phoneNumber"
                          placeholder="Your contact number"
                          value={formData.phoneNumber}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label htmlFor="email" className="form-label">
                          Email Address
                        </label>
                        <input
                          type="email"
                          className="form-control"
                          id="email"
                          name="email"
                          placeholder="your.email@example.com"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Education & Course Section */}
                  <div className="mb-4">
                    <h5
                      className="mb-3"
                      style={{
                        color: "var(--pink-primary)",
                        borderBottom: "1px solid var(--pink-light)",
                        paddingBottom: "8px",
                      }}
                    >
                      Education & Course Details
                    </h5>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="schoolX" className="form-label">
                          School (X) + Marks
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="schoolX"
                          name="schoolX"
                          placeholder="School name and percentage"
                          value={formData.schoolX}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label htmlFor="schoolXII" className="form-label">
                          School (XII) + Marks
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="schoolXII"
                          name="schoolXII"
                          placeholder="School name and percentage"
                          value={formData.schoolXII}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="courseName" className="form-label">
                          Course Name
                        </label>
                        <select
                          className="form-select"
                          id="courseName"
                          name="courseName"
                          value={formData.courseName}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select a course</option>
                          {Array.isArray(courses) &&
                            courses.map((course) => (
                              <option
                                key={course.course_id}
                                value={course.courseName}
                              >
                                {course.courseName}
                              </option>
                            ))}
                        </select>
                      </div>

                      <div className="col-md-6 mb-3">
                        <label htmlFor="admissionDate" className="form-label">
                          Admission Date
                        </label>
                        <input
                          type="date"
                          className="form-control"
                          id="admissionDate"
                          name="admissionDate"
                          value={formData.admissionDate}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Photo Upload Section */}
                  <div className="mb-4">
                    <h5
                      className="mb-3"
                      style={{
                        color: "var(--pink-primary)",
                        borderBottom: "1px solid var(--pink-light)",
                        paddingBottom: "8px",
                      }}
                    >
                      Photo Upload
                    </h5>
                    <div className="row">
                      <div className="col-12 mb-4">
                        <div className="d-flex gap-3 align-items-center">
                          <input
                            type="file"
                            accept="image/*"
                            className="form-control"
                            onChange={handlePhotoUpload}
                            ref={fileInputRef}
                          />
                          <button
                            type="button"
                            className="btn btn-outline-primary"
                            onClick={handleCapturePhoto}
                          >
                            <i className="bi bi-camera-fill me-2"></i>
                            Capture Photo
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Digital Signature Section */}
                  <div className="mb-4">
                    <h5
                      className="mb-3"
                      style={{
                        color: "var(--pink-primary)",
                        borderBottom: "1px solid var(--pink-light)",
                        paddingBottom: "8px",
                      }}
                    >
                      Digital Signature
                    </h5>
                    <div className="row">
                      <div className="col-12 mb-4">
                        <div className="signature-container">
                          <SignatureCanvas
                            ref={sigPad}
                            canvasProps={{
                              className: "signature-canvas",
                              style: {
                                pointerEvents: isSaved ? "none" : "auto",
                              }, // Disable canvas when saved
                            }}
                          />
                          <div className="signature-buttons mt-3 d-flex justify-content-end">
                            <button
                              type="button"
                              className="btn btn-outline-secondary me-2"
                              onClick={clearSignature}
                            >
                              Clear
                            </button>
                            <button
                              type="button"
                              className={`btn ${
                                isSaved
                                  ? "btn-secondary"
                                  : "btn-outline-primary"
                              }`}
                              onClick={saveSignature}
                              disabled={isSaved} // Disable button after saving
                            >
                              {isSaved ? "Saved" : "Save Signature"}
                            </button>
                          </div>
                          {signature && (
                            <div className="text-success mt-2">
                              <small>
                                <i className="bi bi-check-circle-fill me-1"></i>
                                Signature saved successfully
                              </small>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Terms and Conditions */}
                  <div className="mb-4">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="termsCheck"
                        required
                      />
                      <label className="form-check-label" htmlFor="termsCheck">
                        I agree to the{" "}
                        <a href="#" style={{ color: "var(--pink-primary)" }}>
                          Terms and Conditions
                        </a>{" "}
                        and confirm that all information provided is accurate.
                      </label>
                    </div>
                  </div>

                  <div className="text-center mt-5">
                    <button type="submit" className="btn btn-submit px-5 py-2">
                      Submit Application
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Camera Preview Modal */}
      {showCameraPreview && (
        <div
          className="modal fade show"
          style={{ display: "block" }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Camera Preview</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeCameraPreview}
                ></button>
              </div>
              <div className="modal-body text-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  style={{ width: "100%", maxHeight: "60vh" }}
                ></video>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeCameraPreview}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={takePicture}
                >
                  Take Photo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Backdrop */}
      {showCameraPreview && <div className="modal-backdrop fade show"></div>}
    </>
  );
}

export default AdmissionForm;
