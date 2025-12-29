"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Chip,
  Divider,
  TextField,
  Avatar,
  MenuItem,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tab,
  Tabs,
  Badge,
  IconButton,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Switch,
  FormControlLabel,
} from "@mui/material";

import LogoutIcon from "@mui/icons-material/Logout";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PeopleIcon from "@mui/icons-material/People";
import SecurityIcon from "@mui/icons-material/Security";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DashboardIcon from "@mui/icons-material/Dashboard";
import NotificationsIcon from "@mui/icons-material/Notifications";
import RefreshIcon from "@mui/icons-material/Refresh";
import DownloadIcon from "@mui/icons-material/Download";

export default function SuperAdminDashboard() {
  const [tabValue, setTabValue] = useState(0);

  const [users, setUsers] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [gates, setGates] = useState([]);

  const [addUserDialog, setAddUserDialog] = useState(false);
  const [editUserDialog, setEditUserDialog] = useState(null);
  const [deleteUserDialog, setDeleteUserDialog] = useState(null);
  const [viewUserDialog, setViewUserDialog] = useState(null);
  const [addDepartmentDialog, setAddDepartmentDialog] = useState(false);
  const [addGateDialog, setAddGateDialog] = useState(false);

  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("ALL");
  const [userDepartmentFilter, setUserDepartmentFilter] = useState("ALL");
  const [visitorSearch, setVisitorSearch] = useState("");
  const [visitorStatusFilter, setVisitorStatusFilter] = useState("ALL");

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "admin",
    department: "",
    gateId: "",
    isActive: true,
  });

  const [newDepartment, setNewDepartment] = useState({
    name: "",
    code: "",
    description: "",
  });

  const [newGate, setNewGate] = useState({
    name: "",
    location: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const superAdmin = JSON.parse(localStorage.getItem("user") || "{}");

  /* -------------------- API LOADERS -------------------- */

  useEffect(() => {
    loadUsers();
    loadVisitors();
    loadAlerts();
    loadDepartments();
    loadGates();
  }, []);

  const authHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  });

  const loadUsers = async () => {
    const res = await fetch("http://localhost:5000/api/admin/users", {
      headers: authHeader(),
    });
    if (res.ok) setUsers(await res.json());
  };

  const loadVisitors = async () => {
    const res = await fetch("http://localhost:5000/api/visitor", {
      headers: authHeader(),
    });
    if (res.ok) setVisitors(await res.json());
  };

  const loadAlerts = async () => {
    const res = await fetch("http://localhost:5000/api/alert", {
      headers: authHeader(),
    });
    if (res.ok) setAlerts(await res.json());
  };

  const loadDepartments = async () => {
    const res = await fetch("http://localhost:5000/api/admin/departments", {
      headers: authHeader(),
    });
    if (res.ok) setDepartments(await res.json());
  };

  const loadGates = async () => {
    const res = await fetch("http://localhost:5000/api/buildings", {
      headers: authHeader(),
    });
    if (res.ok) setGates(await res.json());
  };

  /* -------------------- HELPERS -------------------- */

  const getRoleColor = (role) =>
    ({
      superadmin: "#8b5cf6",
      admin: "#3b82f6",
      security: "#10b981",
      reception: "#f59e0b",
    }[role] || "#6b7280");

  const getStatusColor = (status) =>
    ({
      PENDING: "warning",
      APPROVED: "success",
      IN: "primary",
      OUT: "default",
      OVERSTAY: "error",
      REJECTED: "error",
    }[status] || "default");

  const logout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  /* -------------------- FILTERS -------------------- */

  const filteredUsers = useMemo(
    () =>
      users.filter(
        (u) =>
          (u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
            u.email?.toLowerCase().includes(userSearch.toLowerCase())) &&
          (userRoleFilter === "ALL" || u.role === userRoleFilter) &&
          (userDepartmentFilter === "ALL" ||
            u.department === userDepartmentFilter)
      ),
    [users, userSearch, userRoleFilter, userDepartmentFilter]
  );

  const filteredVisitors = useMemo(
    () =>
      visitors.filter(
        (v) =>
          (v.name?.toLowerCase().includes(visitorSearch.toLowerCase()) ||
            v.phone?.includes(visitorSearch)) &&
          (visitorStatusFilter === "ALL" ||
            v.status === visitorStatusFilter)
      ),
    [visitors, visitorSearch, visitorStatusFilter]
  );

  /* -------------------- EXPORT -------------------- */

  const exportData = (data, name) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
  };

  /* -------------------- RENDER -------------------- */

  return (
    <Box p={4} bgcolor="#F8FAFC" minHeight="100vh">
      {/* HEADER */}
      <Stack direction="row" justifyContent="space-between" mb={4}>
        <Stack direction="row" spacing={2}>
          <Avatar sx={{ bgcolor: "#8b5cf6", width: 56, height: 56 }}>
            <SupervisorAccountIcon />
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight={700}>
              Super Admin Dashboard
            </Typography>
            <Typography fontSize={13} color="text.secondary">
              {superAdmin?.email}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={2}>
          <IconButton onClick={loadUsers}>
            <RefreshIcon />
          </IconButton>
          <IconButton>
            <Badge badgeContent={alerts.length} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <Button
            variant="outlined"
            color="error"
            startIcon={<LogoutIcon />}
            onClick={logout}
          >
            Logout
          </Button>
        </Stack>
      </Stack>

      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}

      {/* TABS */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label="Users" />
          <Tab label="Visitors" />
          <Tab label="Departments" />
          <Tab label="Gates" />
          <Tab label="System Logs" />
        </Tabs>
      </Paper>

      {/* USERS */}
      {tabValue === 0 && (
        <>
          <Stack direction="row" justifyContent="space-between" mb={2}>
            <Typography variant="h5">Users</Typography>
            <Button
              variant="contained"
              startIcon={<PersonAddIcon />}
              onClick={() => setAddUserDialog(true)}
            >
              Add User
            </Button>
          </Stack>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.map((u) => (
                  <TableRow key={u._id}>
                    <TableCell>{u.name}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={u.role}
                        size="small"
                        sx={{
                          bgcolor: `${getRoleColor(u.role)}20`,
                          color: getRoleColor(u.role),
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Switch checked={u.isActive !== false} />
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => setViewUserDialog(u)}>
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton onClick={() => setEditUserDialog(u)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => setDeleteUserDialog(u)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* VISITORS */}
      {tabValue === 1 && (
        <>
          <Stack direction="row" justifyContent="space-between" mb={2}>
            <Typography variant="h5">Visitors</Typography>
            <Button
              startIcon={<DownloadIcon />}
              onClick={() => exportData(visitors, "visitors.json")}
            >
              Export
            </Button>
          </Stack>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredVisitors.map((v) => (
                  <TableRow key={v._id}>
                    <TableCell>{v.name}</TableCell>
                    <TableCell>{v.phone}</TableCell>
                    <TableCell>
                      <Chip
                        label={v.status}
                        size="small"
                        color={getStatusColor(v.status)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* DEPARTMENTS */}
      {tabValue === 2 && (
        <Grid container spacing={2}>
          {departments.map((d) => (
            <Grid item xs={12} md={4} key={d._id}>
              <Card>
                <CardContent>
                  <Typography fontWeight={600}>{d.name}</Typography>
                  <Typography fontSize={13}>{d.code}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* GATES */}
      {tabValue === 3 && (
        <Grid container spacing={2}>
          {gates.map((g) => (
            <Grid item xs={12} md={4} key={g._id}>
              <Card>
                <CardContent>
                  <Typography fontWeight={600}>{g.name}</Typography>
                  <Typography fontSize={13}>{g.location}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* SYSTEM LOGS */}
      {tabValue === 4 && (
        <Paper sx={{ p: 4 }}>
          <Typography>Audit & system logs appear here</Typography>
        </Paper>
      )}
    </Box>
  );
}

