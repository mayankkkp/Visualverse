import { Card, CardMedia, CardContent, Typography, Box, IconButton, Avatar } from "@mui/material";
import { Favorite, FavoriteBorder } from "@mui/icons-material";

export default function ImageCard({ image, onLike, onOpen }) {
  const liked = image.likes?.some((id) => id === image.owner?._id); // simplistic

  return (
    <Card sx={{ borderRadius: 2, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
      <CardMedia
        component="img"
        image={image.url}
        alt={image.title}
        sx={{ height: 220, objectFit: "cover", cursor: "pointer" }}
        onClick={() => onOpen?.(image)}
      />
      <CardContent>
        <Typography variant="subtitle1" fontWeight={600} noWrap>{image.title}</Typography>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Avatar sx={{ width: 24, height: 24, fontSize: 12, bgcolor: "#6366f1" }}>
              {image.owner?.name?.[0]?.toUpperCase()}
            </Avatar>
            <Typography variant="caption" color="text.secondary">
              {image.owner?.name}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton size="small" onClick={() => onLike?.(image._id)}>
              {liked ? <Favorite color="error" fontSize="small" /> : <FavoriteBorder fontSize="small" />}
            </IconButton>
            <Typography variant="caption">{image.likes?.length || 0}</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}