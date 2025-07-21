// src/components/layout/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  return (
    <div className="w-104 flex flex-col justify-between bg-blue-950 text-white px-6 py-10 shadow-lg min-h-screen">
      <div>
        <h1 className="text-3xl font-extrabold text-center mb-12 leading-tight">
          🎫 VMS <span className="text-yellow-300">Portal</span>
        </h1>
        <nav className="space-y-4">
          <NavLink
            to="/register"
            className={({ isActive }) =>
              `block px-4 py-2 rounded-xl text-base tracking-wide transition duration-200 ${
                isActive
                  ? 'bg-yellow-400 text-blue-900 font-semibold shadow'
                  : 'hover:bg-blue-800 hover:text-yellow-300'
              }`
            }
          >
            🛂 Gate Entry
          </NavLink>

          <NavLink
            to="/appointment-status"
            className={({ isActive }) =>
              `block px-4 py-2 rounded-xl text-base tracking-wide transition duration-200 ${
                isActive
                  ? 'bg-yellow-400 text-blue-900 font-semibold shadow'
                  : 'hover:bg-blue-800 hover:text-yellow-300'
              }`
            }
          >
            📋 Visitor Appointment
          </NavLink>
        </nav>
      </div>
      <footer className="text-xs text-center text-gray-400">
        © 2025 PSG Institutions
      </footer>
    </div>
  );
};

export default Sidebar;
