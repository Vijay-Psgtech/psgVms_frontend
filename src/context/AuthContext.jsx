import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
    } catch (err) {
      console.error("Auth restore error:", err);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("gateId");
    } finally {
      setLoading(false);
    }
  }, []);

  // FINAL login (password / OTP)
  const loginUser = ({ token, user }) => {
    if (!token || !user) {
      console.warn("loginUser called without token or user");
      return;
    }

    const cleanUser = {
      id: user._id || user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      gateId: user.gateId || null,
    };

    setToken(token);
    setUser(cleanUser);

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(cleanUser));

    // ✅ REQUIRED for SecurityDashboard socket auth
    if (cleanUser.gateId) {
      localStorage.setItem("gateId", cleanUser.gateId);
    }
  };

  const logoutUser = () => {
    setToken(null);
    setUser(null);

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("gateId");
    localStorage.removeItem("otpEmail");
  };

  return (
    <AuthContext.Provider
      value={{ token, user, loading, loginUser, logoutUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}
