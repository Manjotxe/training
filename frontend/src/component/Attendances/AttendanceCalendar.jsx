import { useState } from 'react';
import Calendar from 'react-calendar';
import { format } from 'date-fns';
import 'react-calendar/dist/Calendar.css';

function AttendanceCalendar({ attendance }) {
  const [date, setDate] = useState(new Date());

  // Function to determine the tile class
  const tileClassName = ({ date }) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const status = attendance[dateStr]?.toLowerCase(); // Ensure case consistency

    return `calendar-tile ${status || 'no-data'}`;
  };

  // Function to add content inside the calendar tiles
  const tileContent = ({ date, view }) => {
    if (view !== 'month') return null;

    const dateStr = format(date, 'yyyy-MM-dd');
    const status = attendance[dateStr]?.toLowerCase();

   

    return (
      <div className="attendance-indicator">
        {status && (
          <>
            <span className={`status-icon ${status}`}>
              {status === 'present' ? '✓' : '✗'}
            </span>
            <span className={`status-label ${status}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </>
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
