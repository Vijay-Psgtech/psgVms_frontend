"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Divider,
  Avatar,
  Grid,
  Card,
  CardContent,
  Badge,
  IconButton,
  Drawer,
  Chip,
  Alert,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PeopleIcon from "@mui/icons-material/People";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";
import NotificationsIcon from "@mui/icons-material/Notifications";
import CloseIcon from "@mui/icons-material/Close";
import WarningIcon from "@mui/icons-material/Warning";

import VisitorRegistrationForm from "../components/VisitorRegistrationForm";
import VisitorList from "../components/reception/VisitorList";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import io from "socket.io-client";

export default function ReceptionDeskDashboard() {
  const { user, logoutUser } = useAuth();

  const [visitors, setVisitors] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [alertDrawer, setAlertDrawer] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [, forceUpdate] = useState(0);

  /* ================= SOCKET.IO ================= */
  useEffect(() => {
    const socket = io("http://localhost:5000", {
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      console.log("✅ Reception Socket connected");
    });

    socket.on("visitors:update", (data) => {
      console.log("📡 Visitors updated via socket");
      setVisitors(data || []);
    });

    socket.on("alert:new", (alert) => {
      console.log("🔔 New alert received:", alert);
      setAlerts((prev) => [alert, ...prev]);
    });

    return () => socket.disconnect();
  }, []);

  /* ================= LOAD DATA ================= */
  const loadVisitors = async () => {
    try {
      const res = await api.get("/visitor");
      setVisitors(res.data || []);
    } catch (err) {
      console.error("Failed to load visitors", err);
    }
  };

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

    const interval = setInterval(() => {
      loadVisitors();
      loadAlerts();
    }, 10000);

    const timer = setInterval(() => forceUpdate((n) => n + 1), 1000);

    return () => {
      clearInterval(interval);
      clearInterval(timer);
    };
  }, []);

  /* ================= MARK ALERT AS READ ================= */
  const markAlertAsRead = async (alertId) => {
    try {
      await api.patch(`/alert/${alertId}/read`);
      setAlerts((prev) => prev.filter((a) => a._id !== alertId));
    } catch (err) {
      console.error("Failed to mark alert as read", err);
    }
  };

  /* ================= STATS ================= */
  const stats = useMemo(() => {
    return {
      total: visitors.length,
      pending: visitors.filter((v) => v.status === "PENDING").length,
      approved: visitors.filter((v) => v.status === "APPROVED").length,
      inside: visitors.filter((v) => v.status === "IN").length,
      completed: visitors.filter((v) => v.status === "OUT").length,
    };
  }, [visitors]);

  /* ================= HANDLE REGISTRATION SUCCESS ================= */
  const handleRegistrationSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(""), 5000);
    loadVisitors();
  };

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
    <Box minHeight="100vh" p={4} bgcolor="#F8FAFC">
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
          <Avatar sx={{ bgcolor: "#10b981", width: 56, height: 56 }}>
            <PersonAddIcon sx={{ fontSize: 32 }} />
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Reception Desk
            </Typography>
            <Typography fontSize={14} color="text.secondary">
              {user?.name} - Visitor Registration
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

      {/* ================= SUCCESS MESSAGE ================= */}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage("")}>
          {successMessage}
        </Alert>
      )}

      {/* ================= STATS ================= */}
      <Grid container spacing={2} mb={4}>
        {[
          { label: "Total Registered", value: stats.total, icon: <PeopleIcon />, color: "#3b82f6" },
          { label: "Pending Approval", value: stats.pending, icon: <PendingIcon />, color: "#f59e0b" },
          { label: "Approved", value: stats.approved, icon: <CheckCircleIcon />, color: "#10b981" },
          { label: "Currently Inside", value: stats.inside, icon: <CheckCircleIcon />, color: "#8b5cf6" },
          { label: "Completed", value: stats.completed, icon: <CheckCircleIcon />, color: "#06b6d4" },
        ].map(({ label, value, icon, color }) => (
          <Grid item xs={12} sm={6} md={2.4} key={label}>
            <Card
              sx={{
                background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
                borderLeft: `4px solid ${color}`,
              }}
            >
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography fontSize={13} color="text.secondary" fontWeight={500}>
                      {label}
                    </Typography>
                    <Typography variant="h4" fontWeight={700} mt={1} sx={{ color }}>
                      {value}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: `${color}20`, color }}>
                    {icon}
                  </Avatar>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* ================= MAIN CONTENT ================= */}
      <Grid container spacing={3}>
        {/* LEFT: REGISTRATION FORM */}
        <Grid item xs={12} lg={5}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              background: "linear-gradient(135deg, #667eea15 0%, #764ba205 100%)",
              border: "1px solid #e5e7eb",
            }}
          >
            <Stack direction="row" alignItems="center" spacing={2} mb={2}>
              <Avatar sx={{ bgcolor: "#667eea" }}>
                <PersonAddIcon />
              </Avatar>
              <Typography variant="h6" fontWeight={600}>
                Register New Visitor
              </Typography>
            </Stack>
            <Divider sx={{ mb: 3 }} />
            <VisitorRegistrationForm onSuccess={handleRegistrationSuccess} />
          </Paper>
        </Grid>

        {/* RIGHT: VISITOR LIST */}
        <Grid item xs={12} lg={7}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              border: "1px solid #e5e7eb",
            }}
          >
            <Stack direction="row" alignItems="center" spacing={2} mb={2}>
              <Avatar sx={{ bgcolor: "#3b82f6" }}>
                <PeopleIcon />
              </Avatar>
              <Typography variant="h6" fontWeight={600}>
                Registered Visitors
              </Typography>
            </Stack>
            <Divider sx={{ mb: 3 }} />
            <VisitorList visitors={visitors} onUpdate={loadVisitors} />
          </Paper>
        </Grid>
      </Grid>

      {/* ================= ALERTS DRAWER ================= */}
      <Drawer anchor="right" open={alertDrawer} onClose={() => setAlertDrawer(false)}>
        <Box width={400} p={3}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6" fontWeight={600}>
              System Alerts ({alerts.length})
            </Typography>
            <IconButton onClick={() => setAlertDrawer(false)}>
              <CloseIcon />
            </IconButton>
          </Stack>

          <Stack spacing={2}>
            {alerts.length === 0 && (
              <Typography color="text.secondary" textAlign="center" py={4}>
                No alerts
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