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
import Courses from "./component/courses.jsx";
import Bill from "./component/bills.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
<<<<<<< HEAD
        <Route path="/courses" element={<Courses />} />
        <Route path="/profile/:id" element={<Profile />} />
        
=======
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
          path="/profile/:id"
          element={
            localStorage.getItem("role") ? (
              <Profile />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
>>>>>>> e3aa18398a4297d46afb1a985017045bb40030d0
        <Route
          path="/admission"
          element={
            <PrivateRoute>
              <AdmissionForm />
            </PrivateRoute>
          }
        />
<<<<<<< HEAD
         <Route
          path="/bill"
          element={
            <PrivateRoute>
              <Bill />
=======
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
          path="/assignment"
          element={
            <PrivateRoute>
              <Assignment />
>>>>>>> e3aa18398a4297d46afb1a985017045bb40030d0
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
