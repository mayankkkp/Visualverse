import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Container, Card, CardContent, TextField, Button, Typography, Alert, LinearProgress } from "@mui/material";
import Navbar from "../components/Navbar";
import api from "../api/axios";

export default function Upload() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!file) return setError("Please select a file");
    if (!title.trim()) return setError("Title is required");

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("title", title);
      formData.append("description", description);

      await api.post("/api/images/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      navigate("/home");
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Card sx={{ borderRadius: 3, boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Upload Image
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Box component="form" onSubmit={handleSubmit}>
              <Button variant="outlined" component="label" fullWidth sx={{ py: 2, mb: 2 }}>
                {file ? file.name : "Choose Image"}
                <input hidden accept="image/*" type="file" onChange={handleFileChange} />
              </Button>

              {preview && (
                <Box sx={{ mb: 2, textAlign: "center" }}>
                  <img src={preview} alt="preview" style={{ maxHeight: 240, borderRadius: 8 }} />
                </Box>
              )}

              <TextField
                fullWidth label="Title" margin="normal" required
                value={title} onChange={(e) => setTitle(e.target.value)}
              />
              <TextField
                fullWidth label="Description" margin="normal" multiline rows={3}
                value={description} onChange={(e) => setDescription(e.target.value)}
              />

              {loading && <LinearProgress sx={{ mt: 2 }} />}

              <Button
                type="submit" fullWidth variant="contained" disabled={loading}
                sx={{ mt: 3, py: 1.5, bgcolor: "#6366f1", "&:hover": { bgcolor: "#4f46e5" } }}
              >
                {loading ? "Uploading..." : "Upload"}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </>
  );
}