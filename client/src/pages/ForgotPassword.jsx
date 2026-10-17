import { useState } from "react";
import { Link } from "react-router-dom";
import { Box, Card, CardContent, TextField, Button, Typography, Alert } from "@mui/material";
import api from "../api/axios";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(""); setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/forgot-password", { email });
      setMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset link");
    } finally { setLoading(false); }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#f5f5f7", p: 2 }}>
      <Card sx={{ width: 400, maxWidth: "100%", borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" fontWeight={700} gutterBottom>Forgot Password</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Enter your email and we'll send you a reset link.
          </Typography>

          {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth label="Email" type="email" required margin="normal"
              value={email} onChange={(e) => setEmail(e.target.value)}
            />
            <Button type="submit" fullWidth variant="contained" disabled={loading}
              sx={{ mt: 2, py: 1.5, bgcolor: "#6366f1", "&:hover": { bgcolor: "#4f46e5" } }}>
              {loading ? "Sending..." : "Send Reset Link"}
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