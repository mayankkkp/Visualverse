import { useState } from "react";
import { Link } from "react-router-dom";
import { Box, Card, CardContent, TextField, Button, Typography, Alert } from "@mui/material";
import toast from "react-hot-toast";
import api from "../api/axios";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/forgot-password", { email });
      setMessage(res.data.message);
      toast.success("Check your inbox for the reset link 📧");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to send reset link";
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
            Forgot Password?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Enter your email and we'll send you a reset link.
          </Typography>

          {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              required
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 2, py: 1.5 }}
            >
              {loading ? "Sending..." : "Send Reset Link"}
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