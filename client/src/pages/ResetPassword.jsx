import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Box, Card, CardContent, TextField, Button, Typography, Alert } from "@mui/material";
import api from "../api/axios";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(""); setError("");
    setLoading(true);
    try {
      const res = await api.post(`/auth/reset-password/${token}`, { password });
      setMessage(res.data.message + " Redirecting...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed");
    } finally { setLoading(false); }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#f5f5f7", p: 2 }}>
      <Card sx={{ width: 400, maxWidth: "100%", borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" fontWeight={700} gutterBottom>Reset Password</Typography>

          {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth label="New Password" type="password" required margin="normal"
              helperText="At least 6 characters"
              value={password} onChange={(e) => setPassword(e.target.value)}
            />
            <Button type="submit" fullWidth variant="contained" disabled={loading}
              sx={{ mt: 2, py: 1.5, bgcolor: "#6366f1", "&:hover": { bgcolor: "#4f46e5" } }}>
              {loading ? "Resetting..." : "Reset Password"}
            </Button>
          </form>

          <Typography variant="body2" sx={{ mt: 3, textAlign: "center" }}>
            <Link to="/login" style={{ color: "#6366f1" }}>Back to login</Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}