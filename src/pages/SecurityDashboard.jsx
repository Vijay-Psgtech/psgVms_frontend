"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Chip,
  Divider,
  Fade,
  TextField,
  Grid,
  Avatar,
  Tab,
  Tabs,
  Badge,
  IconButton,
  Drawer,
  Card,
  CardContent,
} from "@mui/material";

import LogoutIcon from "@mui/icons-material/Logout";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import DoorFrontIcon from "@mui/icons-material/DoorFront";
import BusinessIcon from "@mui/icons-material/Business";
import WarningIcon from "@mui/icons-material/Warning";
import SecurityIcon from "@mui/icons-material/Security";
import NotificationsIcon from "@mui/icons-material/Notifications";
import CloseIcon from "@mui/icons-material/Close";

import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import io from "socket.io-client";

export default function SecurityDashboard() {
  const { user, logoutUser } = useAuth();

  const [visitors, setVisitors] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [error, setError] = useState("");
  const [tabValue, setTabValue] = useState(0);
  const [search, setSearch] = useState("");
  const [alertDrawer, setAlertDrawer] = useState(false);
  const [, forceTick] = useState(0);

  /* ================= SOCKET.IO ================= */
  useEffect(() => {   
    const socket = io("http://localhost:5000", {
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      console.log("✅ Security Socket connected");
    });

    socket.on("visitors:update", (data) => {
      console.log("📡 Visitors updated via socket");
      setVisitors(data || []);
    });

    socket.on("alert:new", (alert) => {
      console.log("🔔 New alert received:", alert);
      if (user?.gateId && alert.gate === user.gateId) {
        setAlerts((prev) => [alert, ...prev]);
      }
    });

    return () => socket.disconnect();
  }, [user]);

  /* ================= LOAD VISITORS ================= */
  const loadVisitors = async () => {
    try {
      const res = await api.get("/visitor");
      setVisitors(res.data || []);
      setError("");
    } catch (err) {
      setError("Failed to load visitors");
    }
  };

  /* ================= LOAD ALERTS ================= */
  const loadAlerts = async () => {
    try {
      const res = await api.get("/alert");
      setAlerts(res.data || []);
    } catch (err) {
      console.error("Failed to load alerts", err);
    }
  };

  useEffect(() => {
    loadVisitors();
    loadAlerts();

    const poll = setInterval(() => {
      loadVisitors();
      loadAlerts();
    }, 5000);

    const timer = setInterval(() => forceTick((n) => n + 1), 1000);

    return () => {
      clearInterval(poll);
      clearInterval(timer);
    };
  }, []);

  /* ================= CHECK-IN / CHECK-OUT ================= */
  const checkIn = async (id) => {
    try {
      await api.post(`/visitor/check-in/${id}`);
      loadVisitors();
    } catch (err) {
      alert(err.response?.data?.message || "Check-in failed");
    }
  };

  const checkOut = async (id) => {
    try {
      await api.post(`/visitor/check-out/${id}`);
      loadVisitors();
    } catch (err) {
      alert(err.response?.data?.message || "Check-out failed");
    }
  };

  /* ================= MARK ALERT AS READ ================= */
  const markAlertAsRead = async (alertId) => {
    try {
      await api.patch(`/alert/${alertId}/read`);
      setAlerts((prev) => prev.filter((a) => a._id !== alertId));
    } catch (err) {
      console.error("Failed to mark alert as read", err);
    }
  };

  /* ================= LIVE TIMER ================= */
  const liveDuration = (start) => {
    if (!start) return "-";
    const diff = Date.now() - new Date(start).getTime();
    const s = Math.floor(diff / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    return `${h}h ${m % 60}m ${s % 60}s`;
  };

  /* ================= OVERSTAY ================= */
  const isOverstay = (v) =>
    v.allowedUntil && new Date(v.allowedUntil) < new Date();

  const overstayMinutes = (v) =>
    Math.floor((Date.now() - new Date(v.allowedUntil)) / 60000);

  const overstaySeverity = (mins) => {
    if (mins >= 120) return { label: "CRITICAL", color: "error" };
    if (mins >= 60) return { label: "HIGH", color: "warning" };
    if (mins >= 30) return { label: "MEDIUM", color: "warning" };
    return { label: "LOW", color: "info" };
  };

  /* ================= FILTERING ================= */
  const visibleVisitors = useMemo(() => {
    return visitors.filter((v) => {
      // Security: gate match
      if (user?.role === "security") {
        if (!v.gate || !user.gateId) return false;
        if (String(v.gate) !== String(user.gateId)) return false;
      }

      // Search filter
      const matchSearch =
        !search ||
        v.name?.toLowerCase().includes(search.toLowerCase()) ||
        v.phone?.includes(search) ||
        v.visitorId?.includes(search.toUpperCase());

      // Tab filtering
      let matchTab = true;
      if (tabValue === 0) {
        matchTab = v.status === "APPROVED";
      } else if (tabValue === 1) {
        matchTab = ["IN", "OVERSTAY"].includes(v.status);
      } else if (tabValue === 2) {
        matchTab = !["OUT", "EXPIRED", "REJECTED"].includes(v.status);
      }

      return matchSearch && matchTab;
    });
  }, [visitors, search, tabValue, user]);

  /* ================= STATS ================= */
  const stats = useMemo(() => {
    const myVisitors = visitors.filter(
      (v) => String(v.gate) === String(user?.gateId)
    );

    return {
      approved: myVisitors.filter((v) => v.status === "APPROVED").length,
      inside: myVisitors.filter((v) => v.status === "IN").length,
      overstay: myVisitors.filter((v) => v.status === "OVERSTAY").length,
      total: myVisitors.filter((v) =>
        ["APPROVED", "IN", "OVERSTAY"].includes(v.status)
      ).length,
    };
  }, [visitors, user]);

  /* ================= SEVERITY COLOR ================= */
  const getSeverityColor = (severity) => {
    switch (severity) {
      case "CRITICAL":
        return "#ef4444";
      case "HIGH":
        return "#f59e0b";
      case "MEDIUM":
        return "#3b82f6";
      default:
        return "#6b7280";
    }
  };

  return (
    <Box minHeight="100vh" bgcolor="#F8FAFC" p={4}>
      {/* ================= HEADER ================= */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
        flexWrap="wrap"
        gap={2}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar sx={{ bgcolor: "#2563EB", width: 56, height: 56 }}>
            <SecurityIcon />
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Security Dashboard
            </Typography>
            <Typography fontSize={14} color="text.secondary">
              Gate {user?.gateId} - {user?.name}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={2}>
          <IconButton onClick={() => setAlertDrawer(true)} color="inherit">
            <Badge badgeContent={alerts.length} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          <Button
            variant="outlined"
            color="error"
            startIcon={<LogoutIcon />}
            onClick={logoutUser}
          >
            Logout
          </Button>
        </Stack>
      </Stack>

      {/* ================= STATS ================= */}
      <Grid container spacing={2} mb={3}>
        {[
          ["Total Active", stats.total, "#3b82f6"],
          ["Waiting Check-in", stats.approved, "#10b981"],
          ["Currently Inside", stats.inside, "#f59e0b"],
          ["Overstay Alert", stats.overstay, "#ef4444"],
        ].map(([label, value, color]) => (
          <Grid item xs={12} sm={6} md={3} key={label}>
            <Paper
              sx={{
                p: 2.5,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
                borderLeft: `4px solid ${color}`,
              }}
            >
              <Typography fontSize={13} color="text.secondary" fontWeight={500}>
                {label}
              </Typography>
              <Typography variant="h4" fontWeight={700} mt={1} sx={{ color }}>
                {value}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* ================= TABS ================= */}
      <Paper sx={{ mb: 3, borderRadius: 2 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label={`Waiting Check-in (${stats.approved})`} />
          <Tab label={`Inside (${stats.inside + stats.overstay})`} />
          <Tab label="All Active" />
        </Tabs>
      </Paper>

      {/* ================= SEARCH ================= */}
      <TextField
        fullWidth
        placeholder="Search by name, phone, or visitor ID"
        size="small"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 3, maxWidth: 400 }}
      />

      {error && (
        <Typography color="error" mb={2}>
          {error}
        </Typography>
      )}

      {/* ================= VISITOR LIST ================= */}
      {visibleVisitors.length === 0 && (
        <Paper sx={{ p: 4, textAlign: "center", borderRadius: 2 }}>
          <Typography color="text.secondary">No visitors to display</Typography>
        </Paper>
      )}

      <Stack spacing={3}>
        {visibleVisitors.map((v) => {
          const overstay = isOverstay(v);
          const mins = overstay ? overstayMinutes(v) : 0;
          const severity = overstay ? overstaySeverity(mins) : null;

          return (
            <Fade in key={v._id}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 3,
                  borderLeft: `6px solid ${
                    v.status === "OVERSTAY" ? "#ef4444" : "#2563EB"
                  }`,
                }}
              >
                <Typography variant="h6" fontWeight={600}>
                  {v.name}
                </Typography>

                <Stack direction="row" spacing={1} mt={1} flexWrap="wrap" gap={1}>
                  <Typography fontSize={14} color="text.secondary">
                    📞 {v.phone}
                  </Typography>
                  {v.company && (
                    <Typography fontSize={14} color="text.secondary">
                      | 🏢 {v.company}
                    </Typography>
                  )}
                </Stack>

                <Stack direction="row" spacing={1} mt={1} flexWrap="wrap" gap={1}>
                  <Chip icon={<DoorFrontIcon />} label={`Gate ${v.gate}`} size="small" />
                  <Chip icon={<BusinessIcon />} label={`Host: ${v.host}`} size="small" />
                  <Chip
                    label={v.status}
                    size="small"
                    color={
                      v.status === "APPROVED"
                        ? "success"
                        : v.status === "IN"
                        ? "primary"
                        : v.status === "OVERSTAY"
                        ? "error"
                        : "default"
                    }
                  />
                </Stack>

                <Stack direction="row" spacing={1} mt={1} flexWrap="wrap" gap={1}>
                  {v.status === "IN" && (
                    <Chip
                      icon={<AccessTimeIcon />}
                      label={`Inside ${liveDuration(v.checkInTime)}`}
                      color="primary"
                      size="small"
                    />
                  )}

                  {(v.status === "IN" || v.status === "OVERSTAY") && overstay && (
                    <Chip
                      icon={<WarningIcon />}
                      label={`OVERSTAY ${mins} min (${severity.label})`}
                      color={severity.color}
                      size="small"
                    />
                  )}
                </Stack>

                {v.purpose && (
                  <Typography fontSize={13} color="text.secondary" mt={1}>
                    Purpose: {v.purpose}
                  </Typography>
                )}

                <Typography fontSize={12} color="text.secondary" mt={1}>
                  ID: {v.visitorId}
                </Typography>

                <Divider sx={{ my: 2 }} />

                {v.status === "APPROVED" && (
                  <Button fullWidth variant="contained" onClick={() => checkIn(v._id)}>
                    Check In
                  </Button>
                )}

                {(v.status === "IN" || v.status === "OVERSTAY") && (
                  <Button
                    fullWidth
                    variant="contained"
                    color="error"
                    onClick={() => checkOut(v._id)}
                  >
                    Check Out
                  </Button>
                )}
              </Paper>
            </Fade>
          );
        })}
      </Stack>

      {/* ================= ALERTS DRAWER ================= */}
      <Drawer anchor="right" open={alertDrawer} onClose={() => setAlertDrawer(false)}>
        <Box width={400} p={3}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6" fontWeight={600}>
              Alerts ({alerts.length})
            </Typography>
            <IconButton onClick={() => setAlertDrawer(false)}>
              <CloseIcon />
            </IconButton>
          </Stack>

          <Stack spacing={2}>
            {alerts.length === 0 && (
              <Typography color="text.secondary" textAlign="center" py={4}>
                No alerts for your gate
              </Typography>
            )}

            {alerts.map((alert) => (
              <Card
                key={alert._id}
                sx={{
                  borderLeft: `4px solid ${getSeverityColor(alert.severity)}`,
                }}
              >
                <CardContent>
                  <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                    <WarningIcon
                      fontSize="small"
                      sx={{ color: getSeverityColor(alert.severity) }}
                    />
                    <Chip
                      label={alert.severity}
                      size="small"
                      sx={{ bgcolor: `${getSeverityColor(alert.severity)}20` }}
                    />
                    <Chip label={alert.type} size="small" />
                  </Stack>

                  <Typography fontWeight={600} fontSize={14}>
                    {alert.title}
                  </Typography>

                  <Typography fontSize={13} color="text.secondary" mt={1}>
                    {alert.message}
                  </Typography>

                  {alert.visitor && (
                    <Typography fontSize={12} color="text.secondary" mt={1}>
                      Visitor: {alert.visitor.name} ({alert.visitor.visitorId})
                    </Typography>
                  )}

                  <Divider sx={{ my: 1 }} />

                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography fontSize={11} color="text.secondary">
                      {new Date(alert.createdAt).toLocaleString()}
                    </Typography>

                    <Button size="small" onClick={() => markAlertAsRead(alert._id)}>
                      Dismiss
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Box>
      </Drawer>
    </Box>
  );
}