import { AppBar, Toolbar, Typography, Button, Box, Avatar, Container, IconButton, Menu, MenuItem } from "@mui/material";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { label: "Discover", path: "/home" },
    { label: "Upload", path: "/upload" },
  ];

  return (
    <AppBar position="sticky">
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ minHeight: 64 }}>
          <Typography
            component={Link}
            to="/home"
            sx={{
              fontWeight: 700,
              fontSize: 18,
              letterSpacing: "-0.03em",
              color: "#0A0A0A",
              mr: 6,
            }}
          >
            VisualVerse
          </Typography>

          <Box sx={{ display: "flex", gap: 0.5, flex: 1 }}>
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Button
                  key={item.path}
                  component={Link}
                  to={item.path}
                  disableRipple
                  sx={{
                    color: active ? "#0A0A0A" : "#6B7280",
                    fontWeight: active ? 600 : 500,
                    px: 2,
                    py: 1,
                    fontSize: 14,
                    "&:hover": { backgroundColor: "#F3F4F6" },
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
          </Box>

          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ p: 0.5 }}>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: "#0A0A0A",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {user?.name?.[0]?.toUpperCase() || "U"}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              PaperProps={{
                sx: {
                  mt: 1,
                  minWidth: 180,
                  border: "1px solid #E5E7EB",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
                  borderRadius: 2,
                },
              }}
            >
              <MenuItem
                component={Link}
                to={`/u/${user?.id}`}
                onClick={() => setAnchorEl(null)}
                sx={{ fontSize: 14 }}
              >
                View profile
              </MenuItem>
              <MenuItem onClick={handleLogout} sx={{ fontSize: 14 }}>
                Sign out
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}