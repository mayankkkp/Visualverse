import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Box, Card, CardContent, TextField, Button, Typography, Divider, Alert } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", form);
      login(res.data.user, res.data.token);
      navigate("/home");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#f5f5f7", p: 2 }}>
      <Card sx={{ width: 400, maxWidth: "100%", borderRadius: 3, boxShadow: "0 8px 24px rgba(0,0,0,0.1)" }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" fontWeight={700} align="center" gutterBottom sx={{ color: "#6366f1" }}>
            VisualVerse
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Welcome back
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth label="Email" type="email" margin="normal" required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <TextField
              fullWidth label="Password" type="password" margin="normal" required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <Button
              fullWidth type="submit" variant="contained" disabled={loading}
              sx={{ mt: 2, py: 1.5, bgcolor: "#6366f1", "&:hover": { bgcolor: "#4f46e5" } }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <Divider sx={{ my: 3 }}>OR</Divider>

          <Button
            fullWidth variant="outlined" startIcon={<GoogleIcon />}
            onClick={() => { window.location.href = `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/auth/google`; }}
            sx={{ py: 1.2 }}
          >
            Continue with Google
          </Button>

          <Box sx={{ mt: 3, textAlign: "center" }}>
            <Typography variant="body2">
              <Link to="/forgot-password" style={{ color: "#6366f1" }}>Forgot password?</Link>
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Don't have an account?{" "}
              <Link to="/signup" style={{ color: "#6366f1", fontWeight: 600 }}>Sign up</Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}