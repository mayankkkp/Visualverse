import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useAuth } from "../context/AuthContext";

export default function LoginSuccess() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const token = params.get("token");
    const userStr = params.get("user");
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        login(user, token);
        navigate("/home", { replace: true });
      } catch {
        navigate("/login", { replace: true });
      }
    } else {
      navigate("/login", { replace: true });
    }
  }, [params, login, navigate]);

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2 }}>
      <CircularProgress />
      <Typography>Signing you in...</Typography>
    </Box>
  );
}