import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/Lectures.css";

export default function Lectures() {
  const [date, setDate] = useState(new Date());
  const [selectedFilters, setSelectedFilters] = useState([
    "Ongoing",
    "Completed",
    "Upcoming",
  ]);
  const [lectures, setLectures] = useState([]); // State for fetched lectures
  const [loading, setLoading] = useState(false); // Loading state

  const hours = Array.from({ length: 12 }, (_, i) => i + 7); // Hours from 7 AM to 7 PM

  useEffect(() => {
    fetchLectures();
  }, [date]);

  const fetchLectures = async () => {
    setLoading(true);
    try {
      const formattedDate = date.toISOString().split("T")[0]; // Convert date to YYYY-MM-DD format
      const response = await fetch(
        `http://localhost:5000/api/lectures?date=${formattedDate}`
      );
      const data = await response.json();

      // Ensure data.lectures exists and is an array
      setLectures(Array.isArray(data.lectures) ? data.lectures : []);
    } catch (error) {
      console.error("Failed to fetch lectures:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filter) => {
    setSelectedFilters((filters) => filters.filter((f) => f !== filter));
  };

  return (
    <div className="container-fluid bg-white py-4">
      {/* Legend */}
      <div className="d-flex align-items-center gap-3 mb-2 small">
        <span className="fw-medium">Legend:</span>
        <div className="d-flex align-items-center gap-1">
          <div className="legend-color bg-primary"></div>
          <span>Upcoming</span>
        </div>
        <div className="d-flex align-items-center gap-1">
          <div className="legend-color bg-danger"></div>
          <span>Delayed</span>
        </div>
        <div className="d-flex align-items-center gap-1">
          <div className="legend-color bg-success"></div>
          <span>Ongoing</span>
        </div>
        <div className="d-flex align-items-center gap-1">
          <div className="legend-color bg-secondary"></div>
          <span>Completed</span>
        </div>
        <div className="d-flex align-items-center gap-1">
          <div className="legend-color bg-light border"></div>
          <span>Expired</span>
        </div>
      </div>

      <div className="text-center small mb-4">
        Click on the class/meeting name in the below timetable
      </div>

      <div className="row">
        {/* Left Column - Calendar and Filters */}
        <div className="col-md-4">
          <div className="mb-4">
            <Calendar
              onChange={setDate}
              value={date}
              className="border rounded w-100"
            />
          </div>

          {/* Filters */}
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Filters</h5>
              <div className="mb-3">
                {selectedFilters.map((filter) => (
                  <button
                    key={filter}
                    className="btn btn-outline-secondary btn-sm me-2 mb-2"
                    onClick={() => handleFilterChange(filter)}
                  >
                    <span>×</span> {filter}
                  </button>
                ))}
              </div>
              <button className="btn btn-secondary w-100">Apply</button>
            </div>
          </div>
        </div>

        {/* Right Column - Schedule View */}
        <div className="col-md-8">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="card-title">
                  {date.toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}{" "}
                  (India Standard Time)
                </h5>
                <div className="btn-group">
                  <button className="btn btn-outline-secondary btn-sm">
                    Month
                  </button>
                  <button className="btn btn-outline-secondary btn-sm">
                    Week
                  </button>
                  <button className="btn btn-outline-secondary btn-sm">
                    Day
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="text-center">Loading...</div>
              ) : (
                <div className="schedule">
                  {hours.map((hour) => (
                    <div key={hour} className="row mb-2">
                      {/* Time Column */}
                      <div className="col-2 text-muted small">
                        {hour === 12
                          ? "12pm"
                          : hour < 12
                          ? `${hour}am`
                          : `${hour - 12}pm`}
                      </div>
                      {/* Lecture Display */}
                      <div className="col-10 border-top pt-2">
                        {lectures
                          .filter((lecture) => {
                            const lectureHour = new Date(
                              lecture.start_time
                            ).getHours();
                            return lectureHour === hour;
                          })
                          .map((lecture) => (
                            <div
                              key={lecture.title}
                              className="lecture-item bg-secondary text-white p-2 small rounded mb-2"
                              onClick={() =>
                                console.log("Lecture clicked:", lecture.title)
                              }
                            >
                              <div>{lecture.title}</div>
                              <div className="text-muted small">
                                {new Date(
                                  lecture.start_time
                                ).toLocaleTimeString("en-US", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}{" "}
                                -{" "}
                                {new Date(lecture.end_time).toLocaleTimeString(
                                  "en-US",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </div>
                              <div>{lecture.lecturer_name}</div>
                              <div>{lecture.group}</div>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
