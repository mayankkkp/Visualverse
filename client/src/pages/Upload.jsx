import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Container, Card, CardContent, TextField, Button, Typography, Alert, LinearProgress } from "@mui/material";
import Navbar from "../components/Navbar";
import api from "../api/axios";
import toast from "react-hot-toast";

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
    //console.log("Selected file:", f);
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

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

      await api.post("/api/images/upload", formData);

      toast.success("Image uploaded successfully! 🎉");
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
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 3 }}>
              Upload Image
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Box component="form" onSubmit={handleSubmit}>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                sx={{ py: 3, mb: 2, borderStyle: "dashed", borderWidth: 2 }}
              >
                {file ? file.name : "📷 Choose Image"}
                <input hidden accept="image/*" type="file" onChange={handleFileChange} />
              </Button>

              {preview && (
                <Box sx={{ mb: 2, textAlign: "center" }}>
                  <img
                    src={preview}
                    alt="preview"
                    style={{ maxHeight: 300, borderRadius: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
                  />
                </Box>
              )}

              <TextField
                fullWidth
                label="Title"
                margin="normal"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <TextField
                fullWidth
                label="Description"
                margin="normal"
                multiline
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              {loading && <LinearProgress sx={{ mt: 2, borderRadius: 2 }} />}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ mt: 3, py: 1.8 }}
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