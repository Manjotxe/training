import { useState, useEffect, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/AdmissionForm.css";

function AdmissionForm() {
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
    admissionDate: "",
  });
  const [courses, setCourses] = useState([]);
  const [signature, setSignature] = useState(null);
  const [photo, setPhoto] = useState(null);
  const sigPad = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
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

  const handleCapturePhoto = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement("video");
      video.srcObject = stream;
      await video.play();

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d").drawImage(video, 0, 0);

      const photoUrl = canvas.toDataURL("image/jpeg");
      setPhoto(photoUrl);

      stream.getTracks().forEach((track) => track.stop());
    } catch (error) {
      console.error("Error capturing photo:", error);
    }
  };

  const clearSignature = () => {
    sigPad.current.clear();
    setSignature(null);
  };

  const saveSignature = () => {
    if (sigPad.current) {
      setSignature(sigPad.current.toDataURL());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/admissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...formData, signature, photo }),
      });

      const result = await response.json();
      if (response.ok) {
        // SweetAlert for success
        Swal.fire({
          icon: "success",
          title: "Success",
          text: result.message,
        }).then(() => {
          navigate("/"); // Navigate to "/" after the alert is closed
        });
      } else {
        // SweetAlert for error
        Swal.fire({
          icon: "error",
          title: "Error",
          text: result.error,
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      // SweetAlert for unexpected error
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An unexpected error occurred. Please try again later.",
      });
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10">
          <div className="card shadow-lg">
            <div className="card-body p-4 p-md-5">
              <div className="d-flex justify-content-between align-items-start mb-4">
                <h1>Admission Form</h1>
                {photo && (
                  <div className="photo-preview">
                    <img
                      src={photo}
                      alt="Applicant"
                      className="uploaded-photo"
                    />
                  </div>
                )}
              </div>
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="name" className="form-label">
                      Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
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
                      value={formData.pinCode}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="phoneNumber" className="form-label">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    className="form-control"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    email
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

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
                      value={formData.schoolXII}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="courseName" className="form-label">Course Name</label>
                    <select
                      className="form-control"
                      id="courseName"
                      name="courseName"
                      value={formData.courseName}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select a course</option>
                      {Array.isArray(courses) && courses.map((course) => (
                        <option key={course.course_id} value={course.name}>
                          {course.name}
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

                {/* New Photo Upload Section */}
                <div className="row mt-4">
                  <div className="col-12 mb-4">
                    <label className="form-label">Photo</label>
                    <div className="d-flex gap-3">
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
                        Capture Photo
                      </button>
                    </div>
                  </div>
                </div>

                {/* New Digital Signature Section */}
                <div className="row">
                  <div className="col-12 mb-4">
                    <label className="form-label">Digital Signature</label>
                    <div className="signature-container">
                      <SignatureCanvas
                        ref={sigPad}
                        canvasProps={{
                          className: "signature-canvas",
                        }}
                      />
                      <div className="signature-buttons mt-2">
                        <button
                          type="button"
                          className="btn btn-outline-secondary me-2"
                          onClick={clearSignature}
                        >
                          Clear
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-primary"
                          onClick={saveSignature}
                        >
                          Save Signature
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center mt-4">
                  <button type="submit" className="btn btn-submit px-5 py-2">
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdmissionForm;
