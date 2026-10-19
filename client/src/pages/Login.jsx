import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Box, TextField, Button, Typography, Divider, Alert, Stack, Container } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

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
      toast.success(`Welcome back, ${res.data.user.name}`);
      navigate("/home");
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed";
      toast.error(msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex" }}>
      {/* Left — form */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          p: 4,
          bgcolor: "#FAFAFA",
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 380 }}>
          <Typography
            component={Link}
            to="/login"
            sx={{
              display: "block",
              fontWeight: 700,
              fontSize: 20,
              letterSpacing: "-0.03em",
              color: "#0A0A0A",
              mb: 8,
            }}
          >
            VisualVerse
          </Typography>

          <Typography variant="h4" sx={{ mb: 1 }}>
            Sign in
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Enter your credentials to continue
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <Stack spacing={2.5}>
              <Box>
                <Typography variant="body2" sx={{ mb: 0.75, fontWeight: 500, fontSize: 13 }}>
                  Email
                </Typography>
                <TextField
                  fullWidth
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  size="small"
                />
              </Box>
              <Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.75 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, fontSize: 13 }}>
                    Password
                  </Typography>
                  <Link
                    to="/forgot-password"
                    style={{ fontSize: 13, color: "#6B7280" }}
                  >
                    Forgot?
                  </Link>
                </Box>
                <TextField
                  fullWidth
                  type="password"
                  required
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  size="small"
                />
              </Box>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ py: 1.4, fontSize: 14 }}
              >
                {loading ? "Signing in…" : "Sign in"}
              </Button>
            </Stack>
          </form>

          <Divider sx={{ my: 3 }}>
            <Typography variant="caption" sx={{ color: "#9CA3AF", px: 1 }}>
              OR
            </Typography>
          </Divider>

          <Button
            fullWidth
            variant="outlined"
            startIcon={<GoogleIcon sx={{ fontSize: 18 }} />}
            onClick={() => {
              window.location.href = `${process.env.REACT_APP_API_URL}/auth/google`;
            }}
            sx={{ py: 1.3, fontSize: 14 }}
          >
            Continue with Google
          </Button>

          <Typography variant="body2" align="center" sx={{ mt: 5, color: "#6B7280", fontSize: 13 }}>
            No account?{" "}
            <Link to="/signup" style={{ color: "#0A0A0A", fontWeight: 500 }}>
              Create one
            </Link>
          </Typography>
        </Box>
      </Box>

      {/* Right — brand panel */}
      <Box
        sx={{
          flex: 1,
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          justifyContent: "space-between",
          p: 8,
          bgcolor: "#0A0A0A",
          color: "#FFFFFF",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Typography sx={{ fontWeight: 700, fontSize: 14, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.6 }}>
          VisualVerse
        </Typography>

        <Box>
          <Typography
            sx={{
              fontSize: { md: 44, lg: 56 },
              fontWeight: 500,
              letterSpacing: "-0.04em",
              lineHeight: 1.05,
              maxWidth: 520,
            }}
          >
            A quiet place for your visual work.
          </Typography>
          <Typography
            sx={{ mt: 3, fontSize: 16, color: "rgba(255,255,255,0.6)", maxWidth: 440, lineHeight: 1.6 }}
          >
            Share images, discover new perspectives, and build a portfolio that speaks for itself.
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 4, opacity: 0.5 }}>
          <Box>
            <Typography sx={{ fontSize: 28, fontWeight: 500, letterSpacing: "-0.03em" }}>12K+</Typography>
            <Typography sx={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase" }}>Images shared</Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: 28, fontWeight: 500, letterSpacing: "-0.03em" }}>3K+</Typography>
            <Typography sx={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase" }}>Creators</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}