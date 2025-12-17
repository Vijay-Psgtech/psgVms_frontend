"use client";

import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../context/AuthContext";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export default function SecurityDashboard() {
  const { token, user, loading } = useAuth();
  const socketRef = useRef(null);

  const [connected, setConnected] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  useEffect(() => {
    if (loading) return;
    if (!token || user?.role !== "security" || !user?.gateId) {
      console.warn("Waiting for security auth...");
      return;
    }

    if (socketRef.current) return;

    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
      auth: {
        token,
        role: user.role,
        gateId: user.gateId,
      },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      console.log("✅ Socket connected");
    });

    socket.on("disconnect", () => setConnected(false));

    socket.on("SCAN_RESULT", setScanResult);

    socket.on("connect_error", (err) =>
      console.error("Socket error:", err.message)
    );

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, user, loading]);

  if (loading || !user) {
    return <p style={{ padding: 24 }}>Loading security dashboard…</p>;
  }

  return (
    <div style={{ padding: 24 }}>
      <h2>Security Dashboard</h2>

      <p>
        Status:{" "}
        <b style={{ color: connected ? "green" : "red" }}>
          {connected ? "Connected" : "Disconnected"}
        </b>
      </p>

      {!scanResult ? (
        <div style={{ marginTop: 24 }}>Waiting for QR scan…</div>
      ) : (
        <div style={{ marginTop: 24 }}>
          <p><b>Name:</b> {scanResult.name}</p>
          <p><b>Company:</b> {scanResult.company}</p>
          <p><b>Purpose:</b> {scanResult.purpose}</p>
          <p><b>Status:</b> {scanResult.status}</p>
        </div>
      )}
    </div>
  );
}
