import { Card, Typography, Box, Avatar } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ImageCard({ image }) {
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();

  return (
    <Card
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(`/i/${image._id}`)}
      sx={{
        borderRadius: 2,
        overflow: "hidden",
        position: "relative",
        cursor: "pointer",
        border: "1px solid #E5E7EB",
        transition: "border-color 0.15s ease",
        "&:hover": { borderColor: "#9CA3AF" },
      }}
    >
      <Box sx={{ overflow: "hidden" }}>
        <Box
          component="img"
          src={image.url}
          alt={image.title}
          sx={{
            width: "100%",
            display: "block",
            transition: "transform 0.4s ease",
            transform: hovered ? "scale(1.02)" : "scale(1)",
          }}
        />
      </Box>

      <Box sx={{ p: 1.75, borderTop: "1px solid #F3F4F6", bgcolor: "#FFFFFF" }}>
        <Typography
          sx={{
            fontSize: 14,
            fontWeight: 500,
            lineHeight: 1.35,
            mb: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 1,
            WebkitBoxOrient: "vertical",
          }}
        >
          {image.title}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Avatar
              sx={{
                width: 18,
                height: 18,
                fontSize: 9,
                bgcolor: "#0A0A0A",
                fontWeight: 600,
              }}
            >
              {image.owner?.name?.[0]?.toUpperCase()}
            </Avatar>
            <Typography sx={{ fontSize: 12, color: "#6B7280" }}>
              {image.owner?.name}
            </Typography>
          </Box>
          <Typography sx={{ fontSize: 12, color: "#9CA3AF" }}>
            ♡ {image.likes?.length || 0}
          </Typography>
        </Box>
      </Box>
    </Card>
  );
}