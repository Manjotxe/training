import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./component/Index.jsx";
import Login from "./component/login.jsx";
import AdmissionForm from "./component/AdmissionForm.jsx";
import PrivateRoute from "./component/PrivateRoute.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/admission"
          element={
            <PrivateRoute>
              <AdmissionForm />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
