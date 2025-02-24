import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import { format } from "date-fns";
import "react-calendar/dist/Calendar.css";

function AttendanceCalendar({ attendance }) {
  const [date, setDate] = useState(new Date());
  const [attendanceData, setAttendanceData] = useState({});

  useEffect(() => {
    if (attendance?.attendance_data) {
      try {
        const parsedData =
          typeof attendance.attendance_data === "string"
            ? JSON.parse(attendance.attendance_data)
            : attendance.attendance_data;

        setAttendanceData(parsedData);
        console.log("Parsed Attendance Data:", parsedData);
      } catch (error) {
        console.error("Error parsing attendance data:", error);
      }
    }
  }, [attendance]);

  const tileClassName = ({ date }) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const status = attendanceData[dateStr]?.toLowerCase();
    const dayOfWeek = date.getDay();

    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return "calendar-tile holiday";
    }

    return status ? `calendar-tile ${status}` : "calendar-tile no-data";
  };

  const tileContent = ({ date, view }) => {
    if (view !== "month") return null;

    const dateStr = format(date, "yyyy-MM-dd");
    const status = attendanceData[dateStr]?.toLowerCase();
    const dayOfWeek = date.getDay();

    return (
      <div className="attendance-indicator">
        {dayOfWeek === 0 || dayOfWeek === 6 ? (
          <>
            <span className="status-icon holiday">★</span>
            <span className="status-label holiday">Holiday</span>
          </>
        ) : (
          status && (
            <>
              <span className={`status-icon ${status}`}>
                {status === "present" ? "✓" : "✗"}
              </span>
              <span className={`status-label ${status}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            </>
          )
        )}
      </div>
    );
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header-section">
        <h2>Attendance Calendar</h2>
        <div className="calendar-legend">
          <div className="legend-item">
            <span className="legend-dot present"></span>
            <span>Present</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot absent"></span>
            <span>Absent</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot holiday"></span>
            <span>Holiday</span>
          </div>
        </div>
      </div>
      <Calendar
        onChange={setDate}
        value={date}
        tileClassName={tileClassName}
        tileContent={tileContent}
        className="custom-calendar"
        showNeighboringMonth={true}
      />
    </div>
  );
}

export default AttendanceCalendar;