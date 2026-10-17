import { Box, Button, Typography } from "@mui/material";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2 }}>
      <Typography variant="h2" fontWeight={700}>404</Typography>
      <Typography variant="h6">Page not found</Typography>
      <Button component={Link} to="/home" variant="contained" sx={{ bgcolor: "#6366f1" }}>
        Go Home
      </Button>
    </Box>
  );
}