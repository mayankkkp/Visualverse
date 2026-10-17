import { AppBar, Toolbar, Typography, Button, Box, Avatar } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <AppBar position="sticky" sx={{ background: "#fff", color: "#1a1a1a", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography
          component={Link}
          to="/home"
          variant="h6"
          sx={{ fontWeight: 700, color: "#6366f1" }}
        >
          VisualVerse
        </Typography>

        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <Button component={Link} to="/home" color="inherit">Home</Button>
          <Button component={Link} to="/upload" color="inherit">Upload</Button>
          <Button component={Link} to="/account" color="inherit">Account</Button>
          {user && (
            <Avatar sx={{ width: 32, height: 32, bgcolor: "#6366f1" }}>
              {user.name?.[0]?.toUpperCase()}
            </Avatar>
          )}
          <Button onClick={handleLogout} variant="outlined" size="small">Logout</Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}