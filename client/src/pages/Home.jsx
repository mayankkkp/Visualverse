import { useEffect, useState } from "react";
import {
  Container, Typography, Box, Skeleton, TextField,
  InputAdornment, Chip, Stack, Tab, Tabs,
} from "@mui/material";
import { Search } from "@mui/icons-material";
import Masonry from "react-masonry-css";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import ImageCard from "../components/ImageCard";
import api from "../api/axios";

const breakpointCols = { default: 4, 1200: 3, 900: 3, 600: 2, 400: 1 };

export default function Home() {
  const [images, setImages] = useState([]);
  const [followingImages, setFollowingImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [trendingTags, setTrendingTags] = useState([]);
  const [tab, setTab] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api.get("/api/images"),
      api.get("/api/images/tags/trending"),
      api.get("/api/images/feed/following"),
    ])
      .then(([allRes, tagRes, feedRes]) => {
        setImages(allRes.data);
        setTrendingTags(tagRes.data);
        setFollowingImages(feedRes.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const source = tab === 0 ? images : followingImages;

  const filtered = source.filter((img) => {
    const q = search.toLowerCase();
    return (
      img.title.toLowerCase().includes(q) ||
      img.description?.toLowerCase().includes(q) ||
      img.tags?.some((t) => t.includes(q))
    );
  });

  return (
    <>
      <Navbar />

      <Box sx={{ borderBottom: "1px solid #E5E7EB", bgcolor: "#FFFFFF" }}>
        <Container maxWidth="xl">
          <Box sx={{ py: 8, maxWidth: 720 }}>
            <Typography variant="overline" sx={{ color: "#6B7280", display: "block", mb: 2 }}>
              Discover
            </Typography>
            <Typography variant="h2" sx={{ fontSize: { xs: 36, md: 52 }, mb: 2 }}>
              Curated visuals from emerging creators.
            </Typography>
            <Typography sx={{ color: "#6B7280", fontSize: 16, maxWidth: 480, lineHeight: 1.6 }}>
              A quiet collection of photography, illustration, and design — updated daily.
            </Typography>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: 6 }}>
        {/* Tabs */}
        <Tabs
          value={tab}
          onChange={(e, v) => setTab(v)}
          sx={{
            mb: 4,
            borderBottom: "1px solid #E5E7EB",
            "& .MuiTab-root": { textTransform: "none", fontSize: 14, fontWeight: 500, minHeight: 44 },
            "& .Mui-selected": { color: "#0A0A0A !important" },
            "& .MuiTabs-indicator": { backgroundColor: "#0A0A0A" },
          }}
        >
          <Tab label="Discover" />
          <Tab label="Following" />
        </Tabs>

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 5, flexWrap: "wrap", gap: 2 }}>
          <Box>
            <Typography variant="body2" sx={{ color: "#6B7280", fontSize: 13, mb: 1.5 }}>
              {filtered.length} {filtered.length === 1 ? "image" : "images"}
            </Typography>
            {trendingTags.length > 0 && tab === 0 && (
              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
                {trendingTags.map((t) => (
                  <Chip
                    key={t.tag}
                    label={`#${t.tag}`}
                    size="small"
                    onClick={() => navigate(`/tag/${t.tag}`)}
                    sx={{
                      cursor: "pointer",
                      bgcolor: "#F3F4F6",
                      color: "#0A0A0A",
                      "&:hover": { bgcolor: "#E5E7EB" },
                    }}
                  />
                ))}
              </Stack>
            )}
          </Box>

          <TextField
            placeholder="Search titles, tags…"
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
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 3 }}>
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} variant="rounded" height={280} sx={{ borderRadius: 2 }} />
            ))}
          </Box>
        )}

        {!loading && filtered.length === 0 && (
          <Box sx={{ textAlign: "center", py: 12 }}>
            <Typography sx={{ fontSize: 20, fontWeight: 500, mb: 1 }}>
              {tab === 1 ? "Follow some creators" : search ? "No results" : "Nothing here yet"}
            </Typography>
            <Typography sx={{ color: "#6B7280", fontSize: 14 }}>
              {tab === 1
                ? "Images from creators you follow will appear here."
                : search
                ? "Try a different search term."
                : "Be the first to upload."}
            </Typography>
          </Box>
        )}

        {!loading && filtered.length > 0 && (
          <Masonry breakpointCols={breakpointCols} className="masonry-grid" columnClassName="masonry-grid_column">
            {filtered.map((img) => (
              <ImageCard key={img._id} image={img} />
            ))}
          </Masonry>
        )}
      </Container>
    </>
  );
}