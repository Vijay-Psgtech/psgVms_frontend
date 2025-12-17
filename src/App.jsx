// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useAuth } from "./context/AuthContext";

import Sidebar from "./components/layout/Sidebar";
import MainContent from "./components/layout/MainContent";

import PrivateRoute from "./components/PrivateRoute";
import Login from "./pages/Admin/login";
import VisitorRegister from "./pages/Visitors/VisitorRegister";

import AdminLayout from "./components/layouts/Admin/AdminLayout";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminNotification from "./pages/Admin/AdminNotification";
import AdminVisitorLog from "./pages/Admin/AdminVisitorLog";
import AdminAnalytics from "./pages/Admin/AdminAnalytics";
import EmployeeList from "./pages/Admin/Employees/EmployeeList";

// Component to wrap sidebar layout conditionally
const NonAdminLayout = ({ children }) => (
  <div className="flex min-h-screen font-sans bg-gradient-to-r from-slate-100 to-blue-50">
    <Sidebar />
    <MainContent>{children}</MainContent>
  </div>
);

const AppRoutes = () => {
  const { admin } = useAuth();
  const location = useLocation();

  // Check if current route is under /admin
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <>
      {!isAdminRoute ? (
        <NonAdminLayout>
          <Routes>
            <Route path="/visitor-register" element={<VisitorRegister />} />
            {/* Add more non-admin pages here if needed */}
            <Route path="/login" element={<Login />} />
          </Routes>
        </NonAdminLayout>
      ) : (
        <Routes>
          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <AdminLayout admin={admin} />
              </PrivateRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="visitors" element={<AdminVisitorLog />} />
            <Route
              path="notifications"
              element={<AdminNotification hostEmail={admin?.email} />}
            />
            <Route path="visitors-stats" element={<AdminAnalytics />} />
            <Route path="master/employee" element={<EmployeeList />} /> 
          </Route>
        </Routes>
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
};

const App = () => (
  <BrowserRouter>
    <AppRoutes />
  </BrowserRouter>
);

export default App;
