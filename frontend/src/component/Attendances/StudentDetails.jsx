function StudentDetails({ student, attendance }) {
    // Extract attendance data if available
    const attendanceData = attendance || {};
  
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
      // Holidays are ignored in total working days
    });
  
    // Calculate attendance percentage
    const attendancePercentage =
      totalWorkingDays > 0 ? ((totalPresent / totalWorkingDays) * 100).toFixed(2) : "N/A";
  
    return (
      <div className="student-details">
        <div className="student-header">
          <div className="student-main-info">
            <h2>{student.name}</h2>
            <p className="roll-number">Roll No: {student.id}</p>
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
            <span className="label">Class:</span>
            <span className="value">{student.class}</span>
          </div>
          <div className="detail-item">
            <span className="label">Section:</span>
            <span className="value">{student.section}</span>
          </div>
        </div>
      </div>
    );
  }
  
  export default StudentDetails;
  