import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#0A0A0A", contrastText: "#FFFFFF" },   // near-black
    secondary: { main: "#5B21B6" },                          // deep purple, used sparingly
    background: { default: "#FAFAFA", paper: "#FFFFFF" },
    text: {
      primary: "#0A0A0A",
      secondary: "#6B7280",
      disabled: "#9CA3AF",
    },
    divider: "#E5E7EB",
    error: { main: "#DC2626" },
    success: { main: "#059669" },
  },
  typography: {
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    h1: { fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1.05 },
    h2: { fontWeight: 600, letterSpacing: "-0.035em", lineHeight: 1.1 },
    h3: { fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.15 },
    h4: { fontWeight: 600, letterSpacing: "-0.025em", lineHeight: 1.2 },
    h5: { fontWeight: 600, letterSpacing: "-0.02em" },
    h6: { fontWeight: 600, letterSpacing: "-0.015em" },
    subtitle1: { fontWeight: 500 },
    body1: { lineHeight: 1.7 },
    body2: { lineHeight: 1.6 },
    button: { textTransform: "none", fontWeight: 500, letterSpacing: 0 },
    caption: { letterSpacing: "0.02em" },
    overline: { letterSpacing: "0.1em", fontWeight: 600, fontSize: 11 },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: "10px 20px",
          fontWeight: 500,
          boxShadow: "none",
          transition: "all 0.15s ease",
        },
        contained: {
          backgroundColor: "#0A0A0A",
          color: "#FFFFFF",
          "&:hover": {
            backgroundColor: "#1F1F1F",
            boxShadow: "none",
          },
        },
        outlined: {
          borderColor: "#E5E7EB",
          color: "#0A0A0A",
          "&:hover": {
            borderColor: "#0A0A0A",
            backgroundColor: "transparent",
          },
        },
        text: {
          color: "#0A0A0A",
          "&:hover": { backgroundColor: "#F3F4F6" },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
            backgroundColor: "#FFFFFF",
            "& fieldset": { borderColor: "#E5E7EB" },
            "&:hover fieldset": { borderColor: "#9CA3AF" },
            "&.Mui-focused fieldset": {
              borderColor: "#0A0A0A",
              borderWidth: 1.5,
            },
          },
          "& .MuiInputLabel-root": { color: "#6B7280" },
          "& .MuiInputLabel-root.Mui-focused": { color: "#0A0A0A" },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "none",
          border: "1px solid #E5E7EB",
          backgroundImage: "none",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: "none",
          borderBottom: "1px solid #E5E7EB",
          backgroundColor: "#FFFFFF",
          color: "#0A0A0A",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontSize: 12,
          fontWeight: 500,
          height: 24,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 8, fontSize: 13 },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: "#E5E7EB" },
      },
    },
  },
});