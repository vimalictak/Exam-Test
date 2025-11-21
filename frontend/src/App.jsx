import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Admin/Login';
import Dashboard from './pages/Admin/Dashboard';
import VerificationLanding from './pages/Candidate/VerificationLanding';
import Success from './pages/Candidate/Success';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/admin/login" element={<Login />} />
      <Route path="/admin/dashboard" element={<Dashboard />} />
      <Route path="/verify/:token" element={<VerificationLanding />} />
      <Route path="/success" element={<Success />} />
    </Routes>
  );
}

export default App;
