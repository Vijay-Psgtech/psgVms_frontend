import React from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { useAuth } from "./context/AuthContext";
import { ToastContainer } from "react-toastify"

import PrivateRoute from "./components/PrivateRoute";
import Login from "./pages/Admin/login";
import VisitorRegister from './pages/Visitors/VisitorRegister';
import AdminLayout from "./components/layouts/AdminLayout";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminNotification from "./pages/Admin/AdminNotification";
import AdminVisitorLog from "./pages/Admin/AdminVisitorLog";
import AdminAnalytics from "./pages/Admin/AdminAnalytics";



function App() {
  const {admin} = useAuth();
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/visitor-register" element={<VisitorRegister />} />
        <Route path="/admin" element={<PrivateRoute><AdminLayout admin={admin}/></PrivateRoute> }> 
          <Route index element={<AdminDashboard />} />
          <Route path="visitors" element={<AdminVisitorLog />} />
          <Route path="notifications" element={<AdminNotification  hostEmail={admin.email} />} />
          <Route path="visitors-stats" element={<AdminAnalytics />} />
        </Route>
      </Routes>
      <ToastContainer position="top-right" autoClose={ 3000 }/>
    </BrowserRouter>
  )
}

export default App
