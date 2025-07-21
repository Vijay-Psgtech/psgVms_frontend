// src/App.jsx
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import MainContent from './components/layout/MainContent';
import VisitorAppointment from './components/VisitorAppointment';

const App = () => {
  return (
    <Router>
      <div className="flex min-h-screen font-sans bg-gradient-to-r from-slate-100 to-blue-50">
        
        <Sidebar />
        <MainContent />
        {/* <VisitorAppointment /> */}
      </div>
    </Router>
  );
};

export default App;



