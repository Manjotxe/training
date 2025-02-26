import { useState, useEffect } from "react";
import { useParams } from "react-router-dom"; // Import useParams
import Calendar from "react-calendar";
import { format } from "date-fns";
import "react-calendar/dist/Calendar.css";
import "../styles/Calender.css";

function Abc() {
  const { studentId } = useParams(); // Extract studentId from URL
  const [student, setStudent] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [date, setDate] = useState(new Date());
  const today = new Date();

  useEffect(() => {
    if (!studentId) return; // Ensure studentId exists before making requests

    // Fetch student data
    fetch(`http://localhost:8000/fetch_students/?id=${studentId}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.students && data.students.length > 0) {
          setStudent(data.students[0]); // Fixed: Access first student from list
        } else {
          setStudent(null);
        }
      })
      .catch((error) => {
        console.error("Error fetching student:", error);
        setStudent(null);
      });

    // Fetch attendance data
    fetch(`http://localhost:8000/fetch_attendance/?id=${studentId}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.attendance && data.attendance.length > 0) {
          try {
            const studentAttendance = data.attendance.find((a) => a.student_id == studentId);

            if (studentAttendance) {
              const formattedAttendance =
                typeof studentAttendance.attendance_data === "string"
                  ? JSON.parse(studentAttendance.attendance_data)
                  : studentAttendance.attendance_data;

              setAttendance({
                student_name: studentAttendance.student_name,
                attendance_data: formattedAttendance,
              });
            } else {
              setAttendance(null);
            }
          } catch (error) {
            console.error("Error parsing attendance data:", error);
            setAttendance(null);
          }
        } else {
          setAttendance(null);
        }
      })
      .catch((error) => {
        console.error("Error fetching attendance:", error);
        setAttendance(null);
      });
  }, [studentId]); // Dependency on studentId

  if (!student) return <p>Loading student details...</p>;

  // Extract attendance data if available
  const attendanceData = attendance?.attendance_data || {};

  // Count Present, Absent, and Working Days
  let totalPresent = 0;
  let totalAbsent = 0;
  let totalWorkingDays = 0;

  Object.values(attendanceData).forEach((status) => {
    if (status === "Present") {
      totalPresent++;
      totalWorkingDays++;
    } else if (status === "Absent") {
      totalAbsent++;
      totalWorkingDays++;
    }
  });

  // Calculate attendance percentage
  const attendancePercentage =
    totalWorkingDays > 0 ? ((totalPresent / totalWorkingDays) * 100).toFixed(2) : "N/A";

  const tileClassName = ({ date }) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const status = attendanceData[dateStr]?.toLowerCase();
    const dayOfWeek = date.getDay();
    const year = date.getFullYear();

    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return "calendar-tile holiday";
    }
    if (year === 2025 && date < today) {
      return status ? `calendar-tile ${status}` : "calendar-tile absent";
    }
    return status ? `calendar-tile ${status}` : "calendar-tile no-data";
  };

  const tileContent = ({ date, view }) => {
    if (view !== "month") return null;

    const dateStr = format(date, "yyyy-MM-dd");
    const status = attendanceData[dateStr]?.toLowerCase();
    const dayOfWeek = date.getDay();
    const year = date.getFullYear();

    return (
      <div className="attendance-indicator">
        {dayOfWeek === 0 || dayOfWeek === 6 ? (
          <>
            <span className="status-icon holiday">★</span>
            <span className="status-label holiday">Holiday</span>
          </>
        ) : year === 2025 && date < today && !status ? (
          <>
            <span className="status-icon absent">✗</span>
            <span className="status-label absent">Absent</span>
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
    <div className="student-attendance-container">
      <div className="student-details">
        <div className="student-header">
          <div className="student-main-info">
            <h2>{student.name}</h2>
            <p className="roll-number">Student ID: {student.id}</p>
          </div>
          <div className="attendance-summary">
            <div className="summary-item">
              <span className="summary-value">{totalPresent}</span>
              <span className="summary-label">Present</span>
            </div>
            <div className="summary-item">
              <span className="summary-value">{totalAbsent}</span>
              <span className="summary-label">Absent</span>
            </div>
            <div className="summary-item">
              <span className="summary-value">
                {attendancePercentage !== "N/A" ? attendancePercentage + "%" : "N/A"}
              </span>
              <span className="summary-label">Attendance</span>
            </div>
          </div>
        </div>
        <div className="details-grid">
          <div className="detail-item">
            <span className="label">Course:</span>
            <span className="value">{student.courseName}</span>
          </div>
          <div className="detail-item">
            <span className="label">Email:</span>
            <span className="value">{student.email}</span>
          </div>
        </div>
      </div>

      {/* Attendance Calendar */}
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
    </div>
  );
}

export default Abc;
