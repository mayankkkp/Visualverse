import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Container, Box, Typography, Avatar, Button, Skeleton, Divider,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import Masonry from "react-masonry-css";
import Navbar from "../components/Navbar";
import ImageCard from "../components/ImageCard";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const breakpointCols = { default: 3, 900: 2, 500: 1 };

export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ images: 0, likes: 0, followers: 0, following: 0 });
  const [isFollowing, setIsFollowing] = useState(false);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/api/users/${id}`)
      .then((res) => {
        setProfile(res.data.user);
        setStats(res.data.stats);
        setIsFollowing(res.data.isFollowing);
        setImages(res.data.images);
      })
      .catch(() => setError("User not found"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleFollow = async () => {
    setFollowLoading(true);
    try {
      const res = await api.post(`/api/users/${id}/follow`);
      setIsFollowing(res.data.following);
      setStats((prev) => ({
        ...prev,
        followers: res.data.followersCount,
      }));
      toast.success(res.data.following ? "Following" : "Unfollowed");
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    } finally {
      setFollowLoading(false);
    }
  };

  const isOwnProfile = currentUser?.id === profile?._id;

  if (loading) {
    return (
      <>
        <Navbar />
        <Container maxWidth="lg" sx={{ py: 6 }}>
          <Skeleton variant="circular" width={96} height={96} sx={{ mb: 3 }} />
          <Skeleton variant="text" width={200} height={40} />
          <Skeleton variant="text" width={300} />
        </Container>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <Container maxWidth="sm" sx={{ py: 10, textAlign: "center" }}>
          <Typography variant="h4" sx={{ mb: 2 }}>Not found</Typography>
          <Typography sx={{ color: "#6B7280", mb: 4 }}>
            This creator doesn't exist.
          </Typography>
          <Button variant="contained" onClick={() => navigate("/home")}>
            Back to Discover
          </Button>
        </Container>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ mb: 3, color: "#6B7280", textTransform: "none" }}
        >
          Back
        </Button>

        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 4, mb: 6, flexWrap: "wrap" }}>
          <Avatar sx={{ width: 96, height: 96, bgcolor: "#0A0A0A", fontSize: 36, fontWeight: 600 }}>
            {profile?.name?.[0]?.toUpperCase()}
          </Avatar>

          <Box sx={{ flex: 1, minWidth: 260 }}>
            <Typography variant="h3" sx={{ fontSize: { xs: 28, md: 36 }, mb: 1 }}>
              {profile?.name}
            </Typography>

            {profile?.bio && (
              <Typography sx={{ color: "#6B7280", fontSize: 15, lineHeight: 1.7, maxWidth: 520, mb: 3 }}>
                {profile.bio}
              </Typography>
            )}

            <Box sx={{ display: "flex", gap: 4 }}>
              <Box>
                <Typography sx={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em" }}>
                  {stats.images}
                </Typography>
                <Typography sx={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9CA3AF" }}>
                  Images
                </Typography>
              </Box>
              <Box>
                <Typography sx={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em" }}>
                  {stats.likes}
                </Typography>
                <Typography sx={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9CA3AF" }}>
                  Likes
                </Typography>
              </Box>
              <Box>
                <Typography sx={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em" }}>
                  {stats.followers}
                </Typography>
                <Typography sx={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9CA3AF" }}>
                  Followers
                </Typography>
              </Box>
              <Box>
                <Typography sx={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em" }}>
                  {stats.following}
                </Typography>
                <Typography sx={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9CA3AF" }}>
                  Following
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: "flex", gap: 1.5 }}>
            {isOwnProfile ? (
              <Button component={Link} to="/account" variant="outlined" sx={{ textTransform: "none" }}>
                Edit profile
              </Button>
            ) : (
              <Button
                variant={isFollowing ? "outlined" : "contained"}
                onClick={handleFollow}
                disabled={followLoading}
                sx={{ textTransform: "none", minWidth: 100 }}
              >
                {followLoading ? "…" : isFollowing ? "Following" : "Follow"}
              </Button>
            )}
          </Box>
        </Box>

        <Divider sx={{ mb: 4 }} />

        <Typography variant="overline" sx={{ color: "#6B7280", display: "block", mb: 3 }}>
          Work · {stats.images}
        </Typography>

        {images.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 10 }}>
            <Typography sx={{ fontSize: 18, fontWeight: 500, mb: 1 }}>
              No images yet
            </Typography>
            <Typography sx={{ color: "#6B7280", fontSize: 14 }}>
              {isOwnProfile ? "Upload your first image." : "This creator hasn't uploaded anything yet."}
            </Typography>
            {isOwnProfile && (
              <Button component={Link} to="/upload" variant="contained" sx={{ mt: 3, textTransform: "none" }}>
                Upload
              </Button>
            )}
          </Box>
        ) : (
          <Masonry breakpointCols={breakpointCols} className="masonry-grid" columnClassName="masonry-grid_column">
            {images.map((img) => (
              <ImageCard key={img._id} image={img} />
            ))}
          </Masonry>
        )}
      </Container>
    </>
  );
}