import { useEffect, useState } from "react";
import { Box, Container, Grid, Typography, Alert } from "@mui/material";
import Navbar from "../components/Navbar";
import Loader from "../components/Loader";
import ImageCard from "../components/ImageCard";
import Lightbox from "yet-another-react-lightbox";
import api from "../api/axios";

export default function Home() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  useEffect(() => {
    api.get("/api/images")
      .then((res) => setImages(res.data))
      .catch(() => setError("Failed to load images"))
      .finally(() => setLoading(false));
  }, []);

  const handleLike = async (id) => {
    try {
      const res = await api.put(`/api/images/${id}/like`);
      setImages((prev) =>
        prev.map((img) =>
          img._id === id
            ? { ...img, likes: Array(res.data.likes).fill("x") }
            : img
        )
      );
    } catch (err) { console.error(err); }
  };

  return (
    <>
      <Navbar />
      <Container sx={{ py: 4 }}>
        <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>
          Discover
        </Typography>

        {loading && <Loader />}
        {error && <Alert severity="error">{error}</Alert>}
        {!loading && !error && images.length === 0 && (
          <Alert severity="info">No images yet. Be the first to upload!</Alert>
        )}

        <Grid container spacing={3}>
          {images.map((img, idx) => (
            <Grid item xs={12} sm={6} md={4} key={img._id}>
              <ImageCard
                image={img}
                onLike={handleLike}
                onOpen={() => setLightboxIndex(idx)}
              />
            </Grid>
          ))}
        </Grid>
      </Container>

      {lightboxIndex >= 0 && (
        <Lightbox
          open={lightboxIndex >= 0}
          close={() => setLightboxIndex(-1)}
          index={lightboxIndex}
          slides={images.map((i) => ({ src: i.url, title: i.title }))}
        />
      )}
    </>
  );
}