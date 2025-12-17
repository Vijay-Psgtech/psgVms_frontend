"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Stack,
  Divider,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import socket from "../utils/socket";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const STATUS_TABS = ["PENDING", "APPROVED", "REJECTED", "IN", "OUT"];
const OVERSTAY_LIMIT_MIN = 120;

/* ---------------- TIME UTILS ---------------- */
const minutesBetween = (start, end = new Date()) =>
  start ? Math.floor((new Date(end) - new Date(start)) / 60000) : 0;

const formatDuration = (mins) =>
  `${Math.floor(mins / 60)}h ${mins % 60}m`;

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({});
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("PENDING");

  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectId, setRejectId] = useState(null);

  /* ---------------- FETCH ---------------- */
  const fetchAll = async () => {
    const [s, v] = await Promise.all([
      api.get("/visitor/stats"),
      api.get("/visitor"),
      api.get("/audit"),
    ]);

    setStats(s.data);
    setVisitors(v.data);
  };

  useEffect(() => {
    fetchAll().finally(() => setLoading(false));

    socket.on("VISITOR_PENDING", fetchAll);
    socket.on("VISITOR_APPROVAL", fetchAll);
    socket.on("VISITOR_CHECKIN", fetchAll);
    socket.on("VISITOR_CHECKOUT", fetchAll);

    return () => socket.disconnect();
  }, []);

  /* ---------------- LOGOUT ---------------- */
  const logout = () => {
    localStorage.clear();
    socket.disconnect();
    navigate("/login", { replace: true });
  };

  /* ---------------- ACTIONS ---------------- */
  const approve = async (id) => {
    await api.post(`/visitor/approve/${id}`, { action: "APPROVED" });
    fetchAll();
  };

  const submitReject = async () => {
    await api.post(`/visitor/approve/${rejectId}`, {
      action: "REJECTED",
      reason: rejectReason,
    });
    setRejectOpen(false);
    setRejectReason("");
    fetchAll();
  };

  /* ---------------- ANALYTICS ---------------- */
  const visitorsWithMetrics = useMemo(() => {
    return visitors.map((v) => {
      const minutesInside = minutesBetween(v.checkInTime, v.checkOutTime);
      return {
        ...v,
        minutesInside,
        isOverstay: v.status === "IN" && minutesInside > OVERSTAY_LIMIT_MIN,
      };
    });
  }, [visitors]);

  const filteredVisitors = useMemo(
    () => visitorsWithMetrics.filter((v) => v.status === tab),
    [visitorsWithMetrics, tab]
  );

  const avgVisitChart = useMemo(() => {
    const map = {};
    visitorsWithMetrics.forEach((v) => {
      if (!v.checkInTime) return;
      const date = new Date(v.checkInTime).toLocaleDateString();
      map[date] = map[date] || [];
      map[date].push(v.minutesInside);
    });

    return Object.entries(map).map(([date, arr]) => ({
      date,
      avgMinutes: Math.floor(arr.reduce((a, b) => a + b, 0) / arr.length),
    }));
  }, [visitorsWithMetrics]);

  if (loading) return <CircularProgress />;

  return (
    <Box p={3}>
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="h5">Admin Dashboard</Typography>
        <Button color="error" onClick={logout}>Logout</Button>
      </Stack>

      {/* STATS */}
      <Grid container spacing={2} mt={2}>
        {["today", "checkedIn", "checkedOut"].map((k) => (
          <Grid key={k} size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 2 }}>
              <Typography color="text.secondary">{k.toUpperCase()}</Typography>
              <Typography variant="h4">{stats[k]}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* AVERAGE VISIT DURATION */}
      <Paper sx={{ p: 2, mt: 3 }}>
        <Typography variant="h6">Average Visit Duration</Typography>
        <ResponsiveContainer height={260}>
          <AreaChart data={avgVisitChart}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(v) => formatDuration(v)} />
            <Area dataKey="avgMinutes" />
          </AreaChart>
        </ResponsiveContainer>
      </Paper>

      {/* STATUS TABS */}
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mt: 3 }}>
        {STATUS_TABS.map((s) => <Tab key={s} value={s} label={s} />)}
      </Tabs>

      {/* VISITORS */}
      <Paper sx={{ p: 2 }}>
        {filteredVisitors.map((v) => (
          <Paper key={v._id} variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Stack direction="row" justifyContent="space-between">
              <Typography fontWeight={600}>{v.name}</Typography>
              <Stack direction="row" spacing={1}>
                {v.isOverstay && <Chip label="OVERSTAY" color="error" />}
                <Chip label={v.status} />
              </Stack>
            </Stack>

            <Typography variant="body2">
              Host: {v.host} • Phone: {v.phone}
            </Typography>

            <Divider sx={{ my: 1 }} />

            <Stack direction="row" spacing={3}>
              <Typography variant="body2">
                Time Inside: {formatDuration(v.minutesInside)}
              </Typography>
              <Typography variant="body2">
                Meeting Duration: {formatDuration(v.minutesInside)}
              </Typography>
            </Stack>

            {v.status === "PENDING" && (
              <Stack direction="row" spacing={1} mt={1}>
                <Button size="small" onClick={() => approve(v._id)}>Approve</Button>
                <Button size="small" color="error" onClick={() => {
                  setRejectId(v._id);
                  setRejectOpen(true);
                }}>
                  Reject
                </Button>
              </Stack>
            )}
          </Paper>
        ))}
      </Paper>

      {/* REJECT MODAL */}
      <Dialog open={rejectOpen} onClose={() => setRejectOpen(false)}>
        <DialogTitle>Reject Visitor</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Reason"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectOpen(false)}>Cancel</Button>
          <Button color="error" onClick={submitReject}>Reject</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}


  
