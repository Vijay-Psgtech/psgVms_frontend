import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthProvider from "./context/AuthContext";

/* ================= AUTH PAGES ================= */
import Login from "./pages/Login";
import VerifyOTP from "./pages/VerifyOTP";
import Register from "./pages/Register";

/* ================= DASHBOARDS ================= */
import AdminDashboard from "./pages/AdminDashboard";
import AdminOverstayDashboard from "./pages/AdminOverstayDashboard";
import SecurityDashboard from "./pages/SecurityDashboard";
import ReceptionDeskDashboard from "./pages/ReceptionDeskDashboard";

/* ================= VISITOR COMPONENTS ================= */
import VisitorBookingWebsite from "./components/VisitorBookingWebsite"; // ✅ NEW PUBLIC FORM
import VisitorRegistrationForm from "./components/VisitorRegistrationForm"; // ✅ OLD INTERNAL FORM

/* ================= ROUTE GUARDS ================= */
import ProtectedRoute from "./hooks/ProtectedRoute";
import RoleRoute from "./hooks/RoleRoute";

/* ================= ROUTE MAP ================= */
import dashboardRoutes from "./routes/dashboardRoutes";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ========================================
              PUBLIC ROUTES (NO PROTECTION)
          ======================================== */}
          
          {/* Public Visitor Booking - Anyone can access */}
          <Route path="/" element={<VisitorBookingWebsite />} />
          <Route path="/book-visit" element={<VisitorBookingWebsite />} />
          <Route path="/visitor/book" element={<VisitorBookingWebsite />} />
          
          {/* Staff Authentication Pages - Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />

          {/* ========================================
              PROTECTED ROUTES (AUTHENTICATION REQUIRED)
          ======================================== */}

          {/* -------- ADMIN ROUTES -------- */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={["admin"]}>
                  <AdminDashboard />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/overstay"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={["admin"]}>
                  <AdminOverstayDashboard />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          {/* -------- SECURITY ROUTES -------- */}
          <Route
            path="/security"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={["security"]}>
                  <SecurityDashboard />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          {/* -------- RECEPTION ROUTES -------- */}
          <Route
            path="/reception"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={["reception"]}>
                  <ReceptionDeskDashboard />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          {/* Internal Visitor Registration (Reception Only) */}
          <Route
            path="/visitor/register"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={["reception"]}>
                  <VisitorRegistrationForm />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          {/* ========================================
              FALLBACK ROUTE
          ======================================== */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}