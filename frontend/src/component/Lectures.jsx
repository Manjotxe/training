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
      const formattedDate = date.toLocaleDateString("en-CA");
      const response = await fetch(
        `http://localhost:5000/api/lectures?date=${formattedDate}`
      );

      const data = await response.json();

      // Confirm data.lectures is correct
      if (Array.isArray(data)) {
        setLectures(data); // Update state here
      } else {
        console.error("API response is not an array:", data);
      }
    } catch (error) {
      console.error("Failed to fetch lectures:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filter) => {
    setSelectedFilters((filters) => {
      if (filters.includes(filter)) {
        return filters.filter((f) => f !== filter); // Remove filter
      } else {
        return [...filters, filter]; // Add filter
      }
    });
  };

  const getLectureStatus = (startTime, endTime) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (now < start) {
      return "Upcoming"; // Lecture has not started yet
    } else if (now >= start && now <= end) {
      return "Ongoing"; // Lecture is currently ongoing
    } else {
      return "Completed"; // Lecture is over
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Upcoming":
        return "bg-primary"; // Blue for upcoming
      case "Ongoing":
        return "bg-success"; // Green for ongoing
      case "Completed":
        return "bg-secondary"; // Gray for completed
      default:
        return "";
    }
  };

  const getLectureHours = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const startHour = start.getHours();
    const endHour = end.getHours();

    const lectureHours = [];
    for (let hour = startHour; hour < endHour; hour++) {
      // Modify this to exclude the final hour
      lectureHours.push(hour);
    }

    return lectureHours;
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
        <h5>Here is the timetable for all the classes</h5>
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
                {["Upcoming", "Ongoing", "Completed"].map((filter) => (
                  <button
                    key={filter}
                    className={`btn btn-outline-secondary btn-sm me-2 mb-2 ${
                      selectedFilters.includes(filter) ? "active" : ""
                    }`}
                    onClick={() => handleFilterChange(filter)}
                  >
                    <span>×</span> {filter}
                  </button>
                ))}
              </div>
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
                          ? "12 PM"
                          : hour < 12
                          ? `${hour} AM`
                          : `${hour - 12} PM`}
                      </div>
                      {/* Lecture Display */}
                      <div className="col-10 border-top pt-2">
                        {lectures
                          .filter((lecture) => {
                            const startHour = new Date(
                              lecture.start_time
                            ).getHours();
                            const endHour = new Date(
                              lecture.end_time
                            ).getHours();

                            // Check if the current hour is within the lecture's duration
                            return (
                              hour === startHour ||
                              (hour > startHour && hour < endHour)
                            );
                          })
                          .filter((lecture) => {
                            const status = getLectureStatus(
                              lecture.start_time,
                              lecture.end_time
                            );
                            return selectedFilters.includes(status);
                          })
                          .map((lecture) => (
                            <div
                              key={lecture.id}
                              className={`lecture-item ${getStatusClass(
                                getLectureStatus(
                                  lecture.start_time,
                                  lecture.end_time
                                )
                              )} text-white p-2 small rounded mb-2`}
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
                              <div>{lecture.lecture_url}</div>
                              <div>{lecture.group}</div>
                            </div>
                          ))}
                        {/* Handle empty slots */}
                        {lectures.filter(
                          (lecture) =>
                            new Date(lecture.start_time).getHours() === hour
                        ).length === 0 && (
                          <div className="text-muted small">
                            No lectures scheduled
                          </div>
                        )}
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
