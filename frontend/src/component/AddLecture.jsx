import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/AddLecture.css";

const AddLecture = () => {
  const [lectures, setLectures] = useState([]);
  const [newLecture, setNewLecture] = useState({
    title: "",
    startTime: "",
    endTime: "",
    lecturer: "",
    id: null, // Added id to track if it's an edit
  });

  const [editLecture, setEditLecture] = useState(null); // Added state for editing

  // Fetch lectures from backend when component mounts
  useEffect(() => {
    const fetchLectures = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/lectures");

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const lectures = await response.json();
        setLectures(lectures);

        // If you're editing a lecture, update the form values
        if (editLecture) {
          setNewLecture({
            lecturer: editLecture.lecture_url, // assuming "lecturer" is the field name
            title: editLecture.title,
            startTime: new Date(editLecture.start_time)
              .toISOString()
              .slice(0, 16), // Format datetime
            endTime: new Date(editLecture.end_time).toISOString().slice(0, 16),
            id: editLecture.id,
          });
        }
      } catch (error) {
        console.error("Error fetching lectures:", error);
      }
    };

    fetchLectures();
  }, [editLecture]); // Re-run when editLecture changes

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewLecture({ ...newLecture, [name]: value });
  };

  // Handle Add or Update Lecture
  const handleSubmitLecture = async (e) => {
    e.preventDefault();
    const method = newLecture.id ? "PUT" : "POST"; // Check if it's update or add

    const endpoint = newLecture.id
      ? `http://localhost:5000/api/lectures/${newLecture.id}`
      : "http://localhost:5000/api/lectures";

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newLecture.title,
          start_time: newLecture.startTime,
          end_time: newLecture.endTime,
          lecture_url: newLecture.lecturer, // Correct field name
          status: "upcoming", // Or set dynamically
        }),
      });

      const result = await response.json();

      if (response.status === 201 || response.status === 200) {
        const updatedLectures = newLecture.id
          ? lectures.map((lecture) =>
              lecture.id === newLecture.id ? { ...newLecture } : lecture
            )
          : [...lectures, { ...newLecture, id: result.id }];

        setLectures(updatedLectures);
        setNewLecture({
          title: "",
          startTime: "",
          endTime: "",
          lecturer: "", // Clear lecturer field
          id: null,
        });
        setEditLecture(null); // Clear edit mode after submit
      } else {
        console.error(result.message);
      }
    } catch (error) {
      console.error("Error submitting lecture:", error);
    }
  };

  // Handle Edit Lecture
  const handleEditLecture = (id) => {
    const lectureToEdit = lectures.find((lecture) => lecture.id === id);
    setEditLecture(lectureToEdit); // Set the lecture to edit
  };

  // Handle Delete Lecture
  const handleDeleteLecture = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/lectures/${id}`, {
        method: "DELETE",
      });
      if (response.status === 200) {
        setLectures(lectures.filter((lecture) => lecture.id !== id));
      } else {
        console.error("Error deleting lecture");
      }
    } catch (error) {
      console.error("Error deleting lecture:", error);
    }
  };

  return (
    <div className="container-fluid lecture-management">
      <div className="row">
        <div className="col-md-4">
          <div className="card add-lecture-card">
            <div className="card-body">
              <h2 className="card-title">
                {newLecture.id ? "Edit" : "Add"} Lecture
              </h2>
              <form onSubmit={handleSubmitLecture}>
                <div className="mb-3">
                  <label htmlFor="title" className="form-label">
                    Title
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="title"
                    name="title"
                    value={newLecture.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="startTime" className="form-label">
                    Start Time
                  </label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    id="startTime"
                    name="startTime"
                    value={newLecture.startTime}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="endTime" className="form-label">
                    End Time
                  </label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    id="endTime"
                    name="endTime"
                    value={newLecture.endTime}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="lecturer" className="form-label">
                    Lecturer URL
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="lecturer"
                    name="lecturer"
                    value={newLecture.lecturer}
                    onChange={handleInputChange}
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  {newLecture.id ? "Update" : "Add"} Lecture
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-md-8">
          <div className="card lecture-list-card">
            <div className="card-body">
              <h2 className="card-title">Lecture List</h2>
              <table className="table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Start Time</th>
                    <th>End Time</th>
                    <th>URL</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {lectures.map((lecture) => (
                    <tr key={lecture.id}>
                      <td>{lecture.title}</td>
                      <td>{new Date(lecture.start_time).toLocaleString()}</td>
                      <td>{new Date(lecture.end_time).toLocaleString()}</td>
                      <td>
                        <a
                          href={
                            lecture.lecture_url &&
                            lecture.lecture_url.startsWith("http")
                              ? lecture.lecture_url
                              : `https://${lecture.lecture_url}` // Assuming this is a fallback URL
                          }
                        >
                          {lecture.lecture_url}
                        </a>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => handleEditLecture(lecture.id)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteLecture(lecture.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddLecture;
