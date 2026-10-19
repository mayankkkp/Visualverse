import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container, Typography, Box, Skeleton, Button, Divider,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import Masonry from "react-masonry-css";
import Navbar from "../components/Navbar";
import ImageCard from "../components/ImageCard";
import api from "../api/axios";

const breakpointCols = { default: 4, 1200: 3, 900: 3, 600: 2, 400: 1 };

export default function TagPage() {
  const { tag } = useParams();
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/api/images?tag=${encodeURIComponent(tag)}`)
      .then((res) => setImages(res.data))
      .catch(() => setImages([]))
      .finally(() => setLoading(false));
  }, [tag]);

  return (
    <>
      <Navbar />
      <Container maxWidth="xl" sx={{ py: 6 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate("/home")}
          sx={{ mb: 3, color: "#6B7280", textTransform: "none" }}
        >
          Back to Discover
        </Button>

        <Typography variant="overline" sx={{ color: "#6B7280", display: "block", mb: 1 }}>
          Tag
        </Typography>
        <Typography variant="h3" sx={{ fontSize: { xs: 32, md: 44 }, mb: 1 }}>
          #{tag}
        </Typography>
        <Typography sx={{ color: "#6B7280", fontSize: 15, mb: 4 }}>
          {images.length} {images.length === 1 ? "image" : "images"}
        </Typography>

        <Divider sx={{ mb: 4 }} />

        {loading && (
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 3 }}>
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} variant="rounded" height={260} />
            ))}
          </Box>
        )}

        {!loading && images.length === 0 && (
          <Box sx={{ textAlign: "center", py: 12 }}>
            <Typography sx={{ fontSize: 18, fontWeight: 500, mb: 1 }}>
              No images with this tag
            </Typography>
            <Typography sx={{ color: "#6B7280", fontSize: 14 }}>
              Try a different tag or upload something new.
            </Typography>
          </Box>
        )}

        {!loading && images.length > 0 && (
          <Masonry
            breakpointCols={breakpointCols}
            className="masonry-grid"
            classNameColumn="masonry-grid_column"
          >
            {images.map((img) => (
              <ImageCard key={img._id} image={img} />
            ))}
          </Masonry>
        )}
      </Container>
    </>
  );
}