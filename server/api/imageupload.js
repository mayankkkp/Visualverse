const express = require("express");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");
const auth = require("../middleware/auth");
const Image = require("../models/Image");

const router = express.Router();

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "visualverse",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
    transformation: [{ width: 1600, crop: "limit" }]
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// ---------- Upload image ----------
router.post("/upload", auth, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const { title, description } = req.body;
    if (!title) return res.status(400).json({ message: "Title is required" });

    const image = await Image.create({
      title,
      description: description || "",
      url: req.file.path,
      publicId: req.file.filename,
      owner: req.userId
    });

    const populated = await image.populate("owner", "name email avatar");
    res.status(201).json(populated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Upload failed" });
  }
});

// ---------- Get all images (feed) ----------
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