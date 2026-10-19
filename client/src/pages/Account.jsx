import { useEffect, useState } from "react";
import { Box, Container, Card, CardContent, TextField, Button, Typography, Avatar, Grid, Alert } from "@mui/material";
import Navbar from "../components/Navbar";
import Loader from "../components/Loader";
import ImageCard from "../components/ImageCard";
import api from "../api/axios";
import toast from "react-hot-toast";

export default function Account() {
  const [profile, setProfile] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    Promise.all([
      api.get("/auth/me"),
      api.get("/api/images/mine")
    ])
      .then(([profileRes, imagesRes]) => {
        setProfile(profileRes.data);
        setImages(imagesRes.data);
      })
      .catch(() => setMessage("Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const res = await api.put("/auth/me", {
        name: profile.name,
        bio: profile.bio
      });
      setProfile(res.data);
      toast.success("Profile updated!");
      //setMessage("Profile updated!");
    } catch {
      toast.success("Image deleted");
      //setMessage("Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this image?")) return;
    try {
      await api.delete(`/api/images/${id}`);
      setImages((prev) => prev.filter((i) => i._id !== id));
    } catch { alert("Delete failed"); }
  };

  if (loading) return <><Navbar /><Loader /></>;

  return (
    <>
      <Navbar />
      <Container sx={{ py: 4 }}>
        <Card sx={{ mb: 4, borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 3, mb: 3 }}>
              <Avatar sx={{ width: 80, height: 80, fontSize: 32, bgcolor: "#6366f1" }}>
                {profile?.name?.[0]?.toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight={700}>{profile?.name}</Typography>
                <Typography variant="body2" color="text.secondary">{profile?.email}</Typography>
              </Box>
            </Box>

            {message && <Alert severity="info" sx={{ mb: 2 }}>{message}</Alert>}

            <TextField fullWidth label="Name" margin="normal"
              value={profile?.name || ""}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
            <TextField fullWidth label="Bio" margin="normal" multiline rows={3}
              value={profile?.bio || ""}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })} />

            <Button variant="contained" onClick={handleSave} disabled={saving}
              sx={{ mt: 2, bgcolor: "#6366f1", "&:hover": { bgcolor: "#4f46e5" } }}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>

        <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
          My Images ({images.length})
        </Typography>

        {images.length === 0 ? (
          <Alert severity="info">You haven't uploaded any images yet.</Alert>
        ) : (
          <Grid container spacing={3}>
            {images.map((img) => (
              <Grid item xs={12} sm={6} md={4} key={img._id}>
                <Box sx={{ position: "relative" }}>
                  <ImageCard image={img} />
                  <Button
                    size="small" color="error" variant="contained"
                    onClick={() => handleDelete(img._id)}
                    sx={{ position: "absolute", top: 8, right: 8 }}
                  >
                    Delete
                  </Button>
                </Box>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </>
  );
}