import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Container, Card, CardContent, TextField, Button,
  Typography, Alert, LinearProgress, Chip, Stack,
} from "@mui/material";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import toast from "react-hot-toast";

export default function Upload() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const parsedTags = tagsInput
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 5);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!file) return toast.error("Please select a file");
    if (!title.trim()) return toast.error("Title is required");

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("title", title);
      formData.append("description", description);
      formData.append("tags", parsedTags.join(","));

      await api.post("/api/images/upload", formData);

      toast.success("Image uploaded successfully!");
      navigate("/home");
    } catch (err) {
      const msg = err.response?.data?.message || "Upload failed";
      toast.error(msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 600, letterSpacing: "-0.03em", mb: 3 }}>
              Upload image
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Box component="form" onSubmit={handleSubmit}>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                sx={{ py: 3, mb: 2, borderStyle: "dashed", borderWidth: 2, textTransform: "none" }}
              >
                {file ? file.name : "Choose image"}
                <input hidden accept="image/*" type="file" onChange={handleFileChange} />
              </Button>

              {preview && (
                <Box sx={{ mb: 2, textAlign: "center" }}>
                  <img
                    src={preview}
                    alt="preview"
                    style={{ maxHeight: 300, borderRadius: 12, border: "1px solid #E5E7EB" }}
                  />
                </Box>
              )}

              <TextField
                fullWidth label="Title" margin="normal" required
                value={title} onChange={(e) => setTitle(e.target.value)}
                size="small"
              />
              <TextField
                fullWidth label="Description" margin="normal" multiline rows={3}
                value={description} onChange={(e) => setDescription(e.target.value)}
                size="small"
              />
              <TextField
                fullWidth label="Tags (comma separated, max 5)" margin="normal"
                placeholder="e.g. nature, sunset, travel"
                value={tagsInput} onChange={(e) => setTagsInput(e.target.value)}
                size="small"
                helperText="Press comma to separate tags"
              />

              {parsedTags.length > 0 && (
                <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1, mt: 1 }}>
                  {parsedTags.map((tag) => (
                    <Chip key={tag} label={`#${tag}`} size="small" />
                  ))}
                </Stack>
              )}

              {loading && <LinearProgress sx={{ mt: 2, borderRadius: 2 }} />}

              <Button
                type="submit" fullWidth variant="contained" size="large"
                disabled={loading} sx={{ mt: 3, py: 1.5, textTransform: "none" }}
              >
                {loading ? "Uploading…" : "Upload"}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </>
  );
}