import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Container, Box, Typography, Avatar, Button, TextField, IconButton,
  Divider, Alert, Skeleton,
} from "@mui/material";
import { Favorite, FavoriteBorder, ArrowBack, Delete, Send } from "@mui/icons-material";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function ImageDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [image, setImage] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      api.get(`/api/images/${id}`),
      api.get(`/api/images/${id}/comments`),
    ])
      .then(([imgRes, cmtRes]) => {
        setImage(imgRes.data);
        setComments(cmtRes.data);
      })
      .catch(() => setError("Image not found"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleLike = async () => {
    try {
      const res = await api.put(`/api/images/${id}/like`);
      setImage((prev) => ({
        ...prev,
        likes: res.data.liked
          ? [...(prev.likes || []), user?.id || "x"]
          : (prev.likes || []).filter((l) => l !== user?.id),
      }));
    } catch (err) {
      toast.error("Failed to like");
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setPosting(true);
    try {
      const res = await api.post(`/api/images/${id}/comments`, {
        text: newComment,
      });
      setComments([res.data, ...comments]);
      setNewComment("");
      toast.success("Comment posted");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to post comment");
    } finally {
      setPosting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await api.delete(`/api/images/${id}/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      toast.success("Comment deleted");
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const isLiked = image?.likes?.includes(user?.id);

  if (loading) {
    return (
      <>
        <Navbar />
        <Container maxWidth="lg" sx={{ py: 6 }}>
          <Skeleton variant="rounded" sx={{ height: 500, borderRadius: 3 }} />
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
          <Typography sx={{ color: "#6B7280", mb: 4 }}>{error}</Typography>
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
        <IconButton onClick={() => navigate(-1)} sx={{ mb: 2 }}>
          <ArrowBack />
        </IconButton>

        <Box sx={{ display: { md: "flex" }, gap: 6 }}>
          {/* Image */}
          <Box sx={{ flex: 1.2 }}>
            <Box
              sx={{
                bgcolor: "#F3F4F6",
                borderRadius: 3,
                overflow: "hidden",
                border: "1px solid #E5E7EB",
              }}
            >
              <Box
                component="img"
                src={image.url}
                alt={image.title}
                sx={{ width: "100%", display: "block" }}
              />
            </Box>
          </Box>

          {/* Sidebar */}
          <Box sx={{ flex: 1, mt: { xs: 4, md: 0 } }}>
            <Typography
              variant="h3"
              sx={{ fontSize: { xs: 28, md: 36 }, mb: 2 }}
            >
              {image.title}
            </Typography>

            {image.description && (
              <Typography
                sx={{ color: "#6B7280", fontSize: 15, lineHeight: 1.7, mb: 3 }}
              >
                {image.description}
              </Typography>
            )}

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                mb: 3,
                pb: 3,
                borderBottom: "1px solid #E5E7EB",
              }}
            >
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: "#0A0A0A",
                  fontSize: 15,
                  fontWeight: 600,
                }}
              >
                {image.owner?.name?.[0]?.toUpperCase()}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontWeight: 500, fontSize: 14 }}>
                  {image.owner?.name}
                </Typography>
                <Typography sx={{ color: "#9CA3AF", fontSize: 12 }}>
                  Creator
                </Typography>
              </Box>
              <Button
                variant={isLiked ? "contained" : "outlined"}
                startIcon={isLiked ? <Favorite /> : <FavoriteBorder />}
                onClick={handleLike}
                sx={{ borderRadius: 999, textTransform: "none" }}
              >
                {image.likes?.length || 0}
              </Button>
            </Box>

            {/* Comments */}
            <Typography
              variant="overline"
              sx={{ color: "#6B7280", display: "block", mb: 2 }}
            >
              Comments · {comments.length}
            </Typography>

            <Box component="form" onSubmit={handleSubmitComment} sx={{ mb: 3 }}>
              <TextField
                fullWidth
                multiline
                rows={2}
                placeholder="Share your thoughts…"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                size="small"
                sx={{ mb: 1 }}
                inputProps={{ maxLength: 500 }}
              />
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography sx={{ fontSize: 11, color: "#9CA3AF" }}>
                  {newComment.length}/500
                </Typography>
                <Button
                  type="submit"
                  variant="contained"
                  size="small"
                  disabled={posting || !newComment.trim()}
                  endIcon={<Send sx={{ fontSize: 14 }} />}
                >
                  {posting ? "Posting…" : "Post"}
                </Button>
              </Box>
            </Box>

            <Box sx={{ maxHeight: 400, overflowY: "auto" }}>
              {comments.length === 0 && (
                <Typography sx={{ color: "#9CA3AF", fontSize: 13, py: 2 }}>
                  No comments yet. Be the first.
                </Typography>
              )}
              {comments.map((comment) => (
                <Box
                  key={comment._id}
                  sx={{
                    display: "flex",
                    gap: 1.5,
                    py: 2,
                    borderBottom: "1px solid #F3F4F6",
                    "&:last-child": { borderBottom: "none" },
                  }}
                >
                  <Avatar
                    sx={{
                      width: 28,
                      height: 28,
                      bgcolor: "#0A0A0A",
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    {comment.author?.name?.[0]?.toUpperCase()}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography sx={{ fontWeight: 500, fontSize: 13 }}>
                        {comment.author?.name}
                      </Typography>
                      <Typography sx={{ fontSize: 11, color: "#9CA3AF" }}>
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontSize: 14, lineHeight: 1.6, mt: 0.5 }}>
                      {comment.text}
                    </Typography>
                  </Box>
                  {(comment.author?._id === user?.id ||
                    image.owner?._id === user?.id) && (
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteComment(comment._id)}
                      sx={{ alignSelf: "flex-start" }}
                    >
                      <Delete sx={{ fontSize: 14, color: "#9CA3AF" }} />
                    </IconButton>
                  )}
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Container>
    </>
  );
}