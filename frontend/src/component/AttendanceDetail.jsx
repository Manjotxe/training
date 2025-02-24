import { useState, useEffect } from "react";
import { useParams } from "react-router-dom"; // Import useParams
import StudentDetails from "./Attendances/StudentDetails";
import AttendanceCalendar from "./Attendances/AttendanceCalendar";
import "../styles/Calender.css";

function App() {
  const { studentId } = useParams(); // Extract studentId from URL
  const [student, setStudent] = useState(null);
  const [attendance, setAttendance] = useState(null);

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

  return (
    <div className="app-container">
      <h1 className="main-title">Student Attendance Dashboard</h1>
      {student && <StudentDetails student={student} attendance={attendance?.attendance_data} />}
      {attendance && <AttendanceCalendar attendance={attendance} />}
    </div>
  );
}

export default App;
