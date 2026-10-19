import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Box, Card, CardContent, TextField, Button, Typography, Alert } from "@mui/material";
import toast from "react-hot-toast";
import api from "../api/axios";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { password });
      toast.success("Password reset! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      const msg = err.response?.data?.message || "Reset failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#FAFAFA", p: 2 }}>
      <Card sx={{ width: 420, maxWidth: "100%", borderRadius: 4 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
            Reset Password
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Choose a strong new password for your account.
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="New Password"
              type="password"
              required
              margin="normal"
              helperText="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 2, py: 1.5 }}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </Button>
          </form>

          <Typography variant="body2" sx={{ mt: 3, textAlign: "center" }}>
            <Link to="/login" style={{ color: "#7C3AED", fontWeight: 600 }}>
              ← Back to login
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}