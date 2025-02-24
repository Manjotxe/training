import { useState, useEffect } from "react";
import StudentDetails from "./Attendances/StudentDetails";
import AttendanceCalendar from "./Attendances/AttendanceCalendar";
import "../styles/Calender.css";

function App() {
  const [student, setStudent] = useState(null);
  const [attendance, setAttendance] = useState(null);

  useEffect(() => {
    // Fetch student data
    fetch("http://localhost:8000/fetch_students/")
      .then((response) => response.json())
      .then((data) => {
        if (data.students && data.students.length > 0) {
          setStudent(data.students[0]); // Assuming fetching first student
        }
      })
      .catch(() => setStudent(null));

    // Fetch attendance data
    fetch("http://localhost:8000/fetch_attendance/")
      .then((response) => response.json())
      .then((data) => {
        if (data.attendance && data.attendance.length > 0) {
          let attendanceRecord = data.attendance[0]; // Get first student’s attendance
          let formattedAttendance = attendanceRecord.attendance_data || {}; // Use empty object if missing

          setAttendance(formattedAttendance);
        }
      })
      .catch(() => setAttendance(null));
  }, []);

  return (
    <div className="app-container">
      <h1 className="main-title">Student Attendance Dashboard</h1>
      {student && <StudentDetails student={student} attendance={attendance} />}
      {attendance && <AttendanceCalendar attendance={attendance} />}
    </div>
  );
}

export default App;
