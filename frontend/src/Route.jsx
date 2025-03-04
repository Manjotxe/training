import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Home from "./component/Index.jsx";
import Login from "./component/login.jsx";
import Profile from "./component/Profile.jsx";
import AdmissionForm from "./component/AdmissionForm.jsx";
import Data from "./component/data.jsx";
import Courses from "./component/courses.jsx";
import Assignment from "./component/Admin.jsx";
import User from "./component/user.jsx";
import PrivateRoute from "./component/PrivateRoute.jsx";
import Lectures from "./component/Lectures.jsx";
import AddLecture from "./component/AddLecture.jsx";
import Chat from "./component/ChatApp.jsx";
import StudentLocationChart from "./component/StudentLocationChart.jsx";
import AdminChat from "./component/AdminChatApp.jsx";
import AttendanceDetail from "./component/AttendanceDetail.jsx";
import FaceLogin from "./component/FaceLogin.jsx";
import Attendance from "./component/Attendance.jsx";
import CanvasComponent from "./component/CanvasComponent.jsx";
import CourseDetails from "./component/CourseDetails.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/facelogin" element={<FaceLogin />} />
        <Route
          path="/assignments/:id"
          element={
            localStorage.getItem("role") ? (
              <User />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/chat"
          element={
            localStorage.getItem("role") ? (
              <Chat />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/chatadmin"
          element={
            <PrivateRoute>
              <AdminChat />
            </PrivateRoute>
          }
        />
        <Route
          path="/record"
          element={
            <PrivateRoute>
              <StudentLocationChart />
            </PrivateRoute>
          }
        />
        <Route
          path="/attendancedetial/:studentId"
          element={
            <PrivateRoute>
              <AttendanceDetail />
            </PrivateRoute>
          }
        />
        <Route
          path="/attendance"
          element={
            <PrivateRoute>
              <Attendance />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile/:id"
          element={
            localStorage.getItem("role") ? (
              <Profile />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/canvas"
          element={
            <PrivateRoute>
              <CanvasComponent />
            </PrivateRoute>
          }
        />
        <Route
          path="/admission"
          element={
            <PrivateRoute>
              <AdmissionForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/data"
          element={
            <PrivateRoute>
              <Data />
            </PrivateRoute>
          }
        />
        <Route
          path="/course"
          element={
            <PrivateRoute>
              <Courses />
            </PrivateRoute>
          }
        />
        <Route
          path="/add-lecture"
          element={
            <PrivateRoute>
              <AddLecture />
            </PrivateRoute>
          }
        />
        <Route
          path="/assignment"
          element={
            <PrivateRoute>
              <Assignment />
            </PrivateRoute>
          }
        />
        <Route
          path="/lectures"
          element={
            localStorage.getItem("role") ? (
              <Lectures />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route path="/coursedetails/:course_id" element={<CourseDetails />} />
      </Routes>
    </Router>
  );
}

export default App;
