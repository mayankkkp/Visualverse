import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Box, Card, CardContent, TextField, Button, Typography, Alert } from "@mui/material";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/signup", form);
      login(res.data.user, res.data.token);
      navigate("/home");
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#f5f5f7", p: 2 }}>
      <Card sx={{ width: 400, maxWidth: "100%", borderRadius: 3, boxShadow: "0 8px 24px rgba(0,0,0,0.1)" }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" fontWeight={700} align="center" gutterBottom sx={{ color: "#6366f1" }}>
            Create Account
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Join VisualVerse today
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth label="Name" margin="normal" required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <TextField
              fullWidth label="Email" type="email" margin="normal" required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <TextField
              fullWidth label="Password" type="password" margin="normal" required
              helperText="At least 6 characters"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <Button
              fullWidth type="submit" variant="contained" disabled={loading}
              sx={{ mt: 2, py: 1.5, bgcolor: "#6366f1", "&:hover": { bgcolor: "#4f46e5" } }}
            >
              {loading ? "Creating..." : "Sign Up"}
            </Button>
          </form>

          <Typography variant="body2" sx={{ mt: 3, textAlign: "center" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "#6366f1", fontWeight: 600 }}>Sign in</Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}