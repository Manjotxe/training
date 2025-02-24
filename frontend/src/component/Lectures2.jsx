// src/components/Lectures.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";

const Lectures = () => {
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState("2025-01-27"); // Default date, can be dynamic

  // Fetch lectures on component mount and when selectedDate changes
  useEffect(() => {
    const fetchLectures = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/lectures?date=${selectedDate}`
        );
        setLectures(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchLectures();
  }, [selectedDate]);

  if (loading) return <div>Loading lectures...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Lectures on {selectedDate}</h1>

      {/* Optional: Add a date picker to change the date */}
      <input
        type="date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
      />

      {/* Render the lectures */}
      <ul>
        {lectures.map((lecture) => (
          <li key={lecture.id}>
            <h3>{lecture.title}</h3>
            <p>Lecturer: {lecture.lecturer_name}</p>
            <p>
              Status: <span className={lecture.status}>{lecture.status}</span>
            </p>
            <p>
              Time: {new Date(lecture.start_time).toLocaleTimeString()} -{" "}
              {new Date(lecture.end_time).toLocaleTimeString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Lectures;
