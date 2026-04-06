import React, { useState, useMemo } from "react";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Avatar,
  Chip,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import InsightsIcon from "@mui/icons-material/Insights";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";

import { AppStateProvider } from "./context/AppStateContext";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Insights from "./pages/Insights";
import "./styles/style.css";

const DRAWER_WIDTH = 240;

const getTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      primary: { main: "#2563EB" },
      secondary: { main: "#10B981" },
      warning: { main: "#F59E0B" },
      error: { main: "#EF4444" },
      background: {
        default: mode === "light" ? "#F8FAFC" : "#0F172A",
        paper: mode === "light" ? "#FFFFFF" : "#1E293B",
      },
      text: {
        primary: mode === "light" ? "#0F172A" : "#F1F5F9",
        secondary: mode === "light" ? "#64748B" : "#94A3B8",
      },
    },
    typography: {
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      h4: { fontWeight: 700, letterSpacing: "-0.5px" },
      h6: { fontWeight: 600 },
    },
    shape: { borderRadius: 12 },
    components: {
      MuiCard: {
        styleOverrides: {
          root: { boxShadow: "0 1px 3px rgba(0,0,0,0.07), 0 4px 16px rgba(0,0,0,0.04)" },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: { textTransform: "none", fontWeight: 600, borderRadius: 8 },
        },
      },
      MuiChip: {
        styleOverrides: { root: { fontWeight: 600 } },
      },
    },
  });

const NAV_ITEMS = [
  { label: "Dashboard", icon: <DashboardIcon />, key: "dashboard" },
  { label: "Transactions", icon: <ReceiptLongIcon />, key: "transactions" },
  { label: "Insights", icon: <InsightsIcon />, key: "insights" },
];

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [role, setRole] = useState("admin");
  const [darkMode, setDarkMode] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const theme = useMemo(() => getTheme(darkMode ? "dark" : "light"), [darkMode]);
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const drawerContent = (
    <Box className="sidebar-content">
      <Box className="sidebar-logo">
        <Box className="logo-icon">₹</Box>
        <Typography variant="h6" className="logo-text">
          FinTrack
        </Typography>
      </Box>

      <List sx={{ px: 1, flex: 1 }}>
        {NAV_ITEMS.map((item) => (
          <ListItem key={item.key} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              selected={page === item.key}
              onClick={() => {
                setPage(item.key);
                if (isMobile) setMobileOpen(false);
              }}
              className="nav-item"
              sx={{
                borderRadius: 2,
                "&.Mui-selected": {
                  backgroundColor: "primary.main",
                  color: "#fff",
                  "& .MuiListItemIcon-root": { color: "#fff" },
                  "&:hover": { backgroundColor: "#1d4ed8" },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 38 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Box className="sidebar-footer">
        <FormControl size="small" fullWidth>
          <InputLabel>Role</InputLabel>
          <Select
            value={role}
            label="Role"
            onChange={(e) => setRole(e.target.value)}
            sx={{ borderRadius: 2 }}
          >
            <MenuItem value="admin">
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <AdminPanelSettingsIcon fontSize="small" color="primary" />
                Admin
              </Box>
            </MenuItem>
            <MenuItem value="viewer">
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <VisibilityIcon fontSize="small" color="secondary" />
                Viewer
              </Box>
            </MenuItem>
          </Select>
        </FormControl>
        <Chip
          label={role === "admin" ? "Full Access" : "Read Only"}
          color={role === "admin" ? "primary" : "default"}
          size="small"
          sx={{ mt: 1, width: "100%" }}
        />
      </Box>
    </Box>
  );

  const pageMap = {
    dashboard: <Dashboard role={role} />,
    transactions: <Transactions role={role} />,
    insights: <Insights role={role} />,
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppStateProvider>
        <Box sx={{ display: "flex", minHeight: "100vh" }}>
          {/* Desktop Drawer */}
          {!isMobile && (
            <Drawer
              variant="permanent"
              sx={{
                width: DRAWER_WIDTH,
                flexShrink: 0,
                "& .MuiDrawer-paper": {
                  width: DRAWER_WIDTH,
                  boxSizing: "border-box",
                  border: "none",
                  boxShadow: "1px 0 0 rgba(0,0,0,0.06)",
                },
              }}
            >
              {drawerContent}
            </Drawer>
          )}

          {/* Mobile Drawer */}
          {isMobile && (
            <Drawer
              variant="temporary"
              open={mobileOpen}
              onClose={() => setMobileOpen(false)}
              sx={{
                "& .MuiDrawer-paper": { width: DRAWER_WIDTH },
              }}
            >
              {drawerContent}
            </Drawer>
          )}

          {/* Main Content */}
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
            <AppBar
              position="sticky"
              elevation={0}
              sx={{
                bgcolor: "background.paper",
                borderBottom: "1px solid",
                borderColor: "divider",
                color: "text.primary",
              }}
            >
              <Toolbar sx={{ gap: 2 }}>
                {isMobile && (
                  <IconButton onClick={() => setMobileOpen(true)}>
                    <MenuIcon />
                  </IconButton>
                )}
                <Typography variant="h6" sx={{ flex: 1, fontWeight: 700 }}>
                  {NAV_ITEMS.find((n) => n.key === page)?.label}
                </Typography>

                <Chip
                  icon={role === "admin" ? <AdminPanelSettingsIcon /> : <VisibilityIcon />}
                  label={role === "admin" ? "Admin" : "Viewer"}
                  color={role === "admin" ? "primary" : "default"}
                  size="small"
                />

                <Tooltip title="Toggle dark mode">
                  <IconButton onClick={() => setDarkMode((d) => !d)}>
                    {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
                  </IconButton>
                </Tooltip>

                <Avatar sx={{ bgcolor: "primary.main", width: 34, height: 34, fontSize: 14 }}>
                  {role === "admin" ? "A" : "V"}
                </Avatar>
              </Toolbar>
            </AppBar>

            <Box sx={{ flex: 1, p: { xs: 2, md: 3 }, overflow: "auto" }}>
              {pageMap[page]}
            </Box>
          </Box>
        </Box>
      </AppStateProvider>
    </ThemeProvider>
  );
}
