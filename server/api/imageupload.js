const express = require("express");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const auth = require("../middleware/auth");
const Image = require("../models/Image");

const router = express.Router();

// Use memory storage — we'll stream the buffer to Cloudinary manually
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Helper: stream buffer to Cloudinary
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "visualverse",
        transformation: [{ width: 1600, crop: "limit" }],
      },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    stream.end(buffer);
  });
};

// ---------- Upload image ----------
router.post("/upload", auth, upload.single("image"), async (req, res) => {
  // console.log("🔍 req.file:", req.file);
  // console.log("🔍 req.body:", req.body);
  // console.log("🔍 content-type:", req.headers["content-type"]);
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const { title, description } = req.body;
    if (!title) return res.status(400).json({ message: "Title is required" });

    const result = await uploadToCloudinary(req.file.buffer);

    const image = await Image.create({
      title,
      description: description || "",
      url: result.secure_url,
      publicId: result.public_id,
      owner: req.userId,
    });

    const populated = await image.populate("owner", "name email avatar");
    res.status(201).json(populated);
  } catch (err) {
    console.error("❌ Upload error:", err);
    res.status(500).json({ message: err.message || "Upload failed" });
  }
});

// ---------- Get all images ----------
router.get("/", async (req, res) => {
  try {
    const images = await Image.find()
      .sort({ createdAt: -1 })
      .populate("owner", "name email avatar")
      .limit(100);
    res.json(images);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ---------- Get my images ----------
router.get("/mine", auth, async (req, res) => {
  try {
    const images = await Image.find({ owner: req.userId })
      .sort({ createdAt: -1 })
      .populate("owner", "name email avatar");
    res.json(images);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ---------- Like / unlike ----------
router.put("/:id/like", auth, async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) return res.status(404).json({ message: "Image not found" });

    const hasLiked = image.likes.includes(req.userId);
    if (hasLiked) {
      image.likes = image.likes.filter((id) => id.toString() !== req.userId);
    } else {
      image.likes.push(req.userId);
    }
    await image.save();
    res.json({ likes: image.likes.length, liked: !hasLiked });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ---------- Delete image ----------
router.delete("/:id", auth, async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) return res.status(404).json({ message: "Image not found" });
    if (image.owner.toString() !== req.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await cloudinary.uploader.destroy(image.publicId);
    await image.deleteOne();
    res.json({ message: "Image deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;