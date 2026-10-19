import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  LinearProgress,
  Chip,
  Stack,
  CircularProgress,
} from "@mui/material";
import { AutoAwesome } from "@mui/icons-material";
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

  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [aiError, setAiError] = useState("");
  const [modelRef, setModelRef] = useState(null);

  const tfRef = useRef(null);
  const mobilenetRef = useRef(null);
  const navigate = useNavigate();

  // Dynamically load TensorFlow.js + MobileNet from CDN once
  useEffect(() => {
    let cancelled = false;

    const loadModel = async () => {
      try {
        // Load TensorFlow.js
        if (!window.tf) {
          await loadScript(
            "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.20.0/dist/tf.min.js"
          );
        }
        tfRef.current = window.tf;

        // Load MobileNet model
        if (!window.mobilenet) {
          await loadScript(
            "https://cdn.jsdelivr.net/npm/@tensorflow-models/mobilenet@2.1.1/dist/mobilenet.min.js"
          );
        }

        if (!cancelled) {
          const model = await window.mobilenet.load({ version: 2, alpha: 0.5 });
          mobilenetRef.current = model;
          setModelRef(model);
          console.log("✅ AI model loaded");
        }
      } catch (err) {
        console.error("AI model load failed:", err);
        if (!cancelled) setAiError("AI unavailable");
      }
    };

    loadModel();

    return () => {
      cancelled = true;
    };
  }, []);

  const loadScript = (src) =>
    new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) return resolve();
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });

  const handleFileChange = async (e) => {
    const f = e.target.files[0];
    if (!f) return;

    setFile(f);
    setPreview(URL.createObjectURL(f));
    setAiSuggestions([]);
    setAiError("");

    // Wait for model to be ready, then classify
    if (mobilenetRef.current) {
      await classifyImage(f);
    } else {
      // Model is loading — wait up to 15 seconds
      const start = Date.now();
      while (!mobilenetRef.current && Date.now() - start < 15000) {
        await new Promise((r) => setTimeout(r, 200));
      }
      if (mobilenetRef.current) {
        await classifyImage(f);
      }
    }
  };

  const classifyImage = async (file) => {
    if (!mobilenetRef.current) return;
    setAiLoading(true);
    setAiError("");

    try {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const predictions = await mobilenetRef.current.classify(img, 5);

      // Clean predictions into tags
      const cleaned = predictions
        .map((p) => {
          // "Egyptian cat" → "egyptian cat"
          const label = p.className.split(",")[0].trim().toLowerCase();
          return {
            tag: label,
            confidence: Math.round(p.probability * 100),
          };
        })
        .filter((p) => p.confidence > 10) // Only suggestions above 10%
        .filter((p) => p.tag.length > 2) // Ignore junk like "or"
        .slice(0, 5);

      setAiSuggestions(cleaned);
    } catch (err) {
      console.error("Classification failed:", err);
      setAiError("Could not analyze image");
    } finally {
      setAiLoading(false);
    }
  };

  const parsedTags = tagsInput
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 5);

  const acceptSuggestion = (tag) => {
    if (parsedTags.includes(tag)) {
      toast.error("Tag already added");
      return;
    }
    if (parsedTags.length >= 5) {
      toast.error("Max 5 tags");
      return;
    }
    setTagsInput((prev) => (prev ? `${prev}, ${tag}` : tag));
    setAiSuggestions((prev) => prev.filter((p) => p.tag !== tag));
  };

  const acceptAllSuggestions = () => {
    const room = 5 - parsedTags.length;
    if (room <= 0) {
      toast.error("Max 5 tags reached");
      return;
    }
    const newTags = aiSuggestions
      .slice(0, room)
      .map((p) => p.tag)
      .filter((t) => !parsedTags.includes(t));

    if (newTags.length === 0) {
      toast.error("No new tags to add");
      return;
    }

    setTagsInput((prev) =>
      prev ? `${prev}, ${newTags.join(", ")}` : newTags.join(", ")
    );
    setAiSuggestions([]);
    toast.success(`Added ${newTags.length} tags`);
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
            <Typography
              variant="h4"
              sx={{ fontWeight: 600, letterSpacing: "-0.03em", mb: 3 }}
            >
              Upload image
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                sx={{
                  py: 3,
                  mb: 2,
                  borderStyle: "dashed",
                  borderWidth: 2,
                  textTransform: "none",
                }}
              >
                {file ? file.name : "Choose image"}
                <input
                  hidden
                  accept="image/*"
                  type="file"
                  onChange={handleFileChange}
                />
              </Button>

              {preview && (
                <Box sx={{ mb: 2, textAlign: "center" }}>
                  <img
                    src={preview}
                    alt="preview"
                    style={{
                      maxHeight: 300,
                      borderRadius: 12,
                      border: "1px solid #E5E7EB",
                    }}
                  />
                </Box>
              )}

              {/* AI Auto-tagging section */}
              {(aiLoading || aiSuggestions.length > 0 || aiError) && (
                <Box
                  sx={{
                    mb: 2,
                    p: 2,
                    border: "1px solid #E5E7EB",
                    borderRadius: 2,
                    bgcolor: "#FAFAFA",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: aiSuggestions.length > 0 ? 1.5 : 0,
                    }}
                  >
                    <AutoAwesome sx={{ fontSize: 18, color: "#7C3AED" }} />
                    <Typography
                      sx={{
                        fontSize: 13,
                        fontWeight: 500,
                        letterSpacing: "0.02em",
                      }}
                    >
                      AI suggests
                    </Typography>
                    {aiLoading && (
                      <CircularProgress size={14} sx={{ ml: 1 }} />
                    )}
                    {aiSuggestions.length > 0 && (
                      <Button
                        size="small"
                        onClick={acceptAllSuggestions}
                        sx={{
                          ml: "auto",
                          fontSize: 12,
                          textTransform: "none",
                          minWidth: 0,
                          p: 0.5,
                        }}
                      >
                        Add all
                      </Button>
                    )}
                  </Box>

                  {aiError && (
                    <Typography sx={{ fontSize: 12, color: "#9CA3AF" }}>
                      {aiError}
                    </Typography>
                  )}

                  {aiLoading && aiSuggestions.length === 0 && (
                    <Typography sx={{ fontSize: 12, color: "#9CA3AF" }}>
                      Analyzing image…
                    </Typography>
                  )}

                  {aiSuggestions.length > 0 && (
                    <Stack
                      direction="row"
                      sx={{ flexWrap: "wrap", gap: 1 }}
                    >
                      {aiSuggestions.map((s) => (
                        <Chip
                          key={s.tag}
                          label={`${s.tag} · ${s.confidence}%`}
                          size="small"
                          onClick={() => acceptSuggestion(s.tag)}
                          clickable
                          sx={{
                            bgcolor: "#FFFFFF",
                            border: "1px solid #E5E7EB",
                            color: "#0A0A0A",
                            fontSize: 11,
                            "&:hover": {
                              bgcolor: "#F3F4F6",
                              borderColor: "#7C3AED",
                            },
                          }}
                        />
                      ))}
                    </Stack>
                  )}
                </Box>
              )}

              <TextField
                fullWidth
                label="Title"
                margin="normal"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                size="small"
              />
              <TextField
                fullWidth
                label="Description"
                margin="normal"
                multiline
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                size="small"
              />
              <TextField
                fullWidth
                label="Tags (comma separated, max 5)"
                margin="normal"
                placeholder="e.g. nature, sunset, travel"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                size="small"
                helperText="Press comma to separate tags"
              />

              {parsedTags.length > 0 && (
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ flexWrap: "wrap", gap: 1, mt: 1 }}
                >
                  {parsedTags.map((tag) => (
                    <Chip
                      key={tag}
                      label={`#${tag}`}
                      size="small"
                      onDelete={() =>
                        setTagsInput(
                          parsedTags.filter((t) => t !== tag).join(", ")
                        )
                      }
                    />
                  ))}
                </Stack>
              )}

              {loading && (
                <LinearProgress sx={{ mt: 2, borderRadius: 2 }} />
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ mt: 3, py: 1.5, textTransform: "none" }}
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