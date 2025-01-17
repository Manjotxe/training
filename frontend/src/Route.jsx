import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./component/Index.jsx";
import Login from "./component/login.jsx";
import Profile from "./component/Profile.jsx";
import AdmissionForm from "./component/AdmissionForm.jsx";
import Data from "./component/Data.jsx";
import Courses from "./component/courses.jsx";
import PrivateRoute from "./component/PrivateRoute.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/Profile/:id"
          element={
            <PrivateRoute>
              <Profile />
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
      </Routes>
    </Router>
  );
}

export default App;
