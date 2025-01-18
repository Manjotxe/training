import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./component/Index.jsx";
import Login from "./component/login.jsx";
import AdmissionForm from "./component/AdmissionForm.jsx";
import PrivateRoute from "./component/PrivateRoute.jsx";
import Data from "./data/data.jsx";
import Assignment from "./data/admin.jsx";
import Asignment from "./data/user.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/asgnment" element={<Asignment />} />
        <Route
          path="/admission" element={
          <PrivateRoute>
            <AdmissionForm />
          </PrivateRoute>
          }
        />
        <Route
          path="/data" element={
          <PrivateRoute>
            <Data />
          </PrivateRoute>
          }
        />
        <Route
          path="/assignment" element={
          <PrivateRoute>
            <Assignment />
          </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
