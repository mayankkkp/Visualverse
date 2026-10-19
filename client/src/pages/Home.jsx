import { useEffect, useState } from "react";
import {
  Container, Typography, Box, Skeleton, TextField, InputAdornment, Divider,
} from "@mui/material";
import { Search } from "@mui/icons-material";
import Masonry from "react-masonry-css";
import Navbar from "../components/Navbar";
import ImageCard from "../components/ImageCard";
import api from "../api/axios";

const breakpointCols = { default: 4, 1200: 3, 900: 3, 600: 2, 400: 1 };

export default function Home() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  useEffect(() => {
    api.get("/api/images")
      .then((res) => setImages(res.data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = images.filter(
    (img) =>
      img.title.toLowerCase().includes(search.toLowerCase()) ||
      img.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Navbar />

      {/* Header strip */}
      <Box sx={{ borderBottom: "1px solid #E5E7EB", bgcolor: "#FFFFFF" }}>
        <Container maxWidth="xl">
          <Box sx={{ py: 8, maxWidth: 720 }}>
            <Typography
              variant="overline"
              sx={{ color: "#6B7280", display: "block", mb: 2 }}
            >
              Discover
            </Typography>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: 36, md: 52 },
                mb: 2,
              }}
            >
              Curated visuals from emerging creators.
            </Typography>
            <Typography
              sx={{ color: "#6B7280", fontSize: 16, maxWidth: 480, lineHeight: 1.6 }}
            >
              A quiet collection of photography, illustration, and design — updated daily.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Search + Grid */}
      <Container maxWidth="xl" sx={{ py: 6 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 5,
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Typography variant="body2" sx={{ color: "#6B7280", fontSize: 13 }}>
            {filtered.length} {filtered.length === 1 ? "image" : "images"}
          </Typography>
          <TextField
            placeholder="Search by title…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            sx={{ width: 280 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ fontSize: 18, color: "#9CA3AF" }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {loading && (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 3,
            }}
          >
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} variant="rounded" height={280} sx={{ borderRadius: 2 }} />
            ))}
          </Box>
        )}

        {!loading && filtered.length === 0 && (
          <Box sx={{ textAlign: "center", py: 12 }}>
            <Typography sx={{ fontSize: 20, fontWeight: 500, mb: 1 }}>
              {search ? "No results" : "Nothing here yet"}
            </Typography>
            <Typography sx={{ color: "#6B7280", fontSize: 14 }}>
              {search ? "Try a different search term." : "Be the first to upload."}
            </Typography>
          </Box>
        )}

        {!loading && filtered.length > 0 && (
          <Masonry
            breakpointCols={breakpointCols}
            className="masonry-grid"
            columnClassName="masonry-grid_column"
          >
            {filtered.map((img, idx) => (
              <ImageCard
                image={img}
              />
            ))}
          </Masonry>
        )}
      </Container>
    </>
  );
}