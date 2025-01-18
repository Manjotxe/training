import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./component/Index.jsx";
import Login from "./component/login.jsx";
import Profile from "./component/Profile.jsx";
import AdmissionForm from "./component/AdmissionForm.jsx";
import PrivateRoute from "./component/PrivateRoute.jsx";
import Courses from "./component/courses.jsx";
import Bill from "./component/bills.jsx";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/profile/:id" element={<Profile />} />
        
        <Route
          path="/admission"
          element={
            <PrivateRoute>
              <AdmissionForm />
            </PrivateRoute>
          }
        />
         <Route
          path="/bill"
          element={
            <PrivateRoute>
              <Bill />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
