const express = require("express");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const auth = require("../middleware/auth");
const Image = require("../models/Image");
const Comment = require("../models/Comment");
const User = require("../models/User");
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
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const { title, description, tags } = req.body;
    if (!title) return res.status(400).json({ message: "Title is required" });

    // Parse tags: comma-separated string → array of lowercase trimmed strings
    const tagArray = (tags || "")
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 5);  // max 5 tags

    const result = await uploadToCloudinary(req.file.buffer);

    const image = await Image.create({
      title,
      description: description || "",
      url: result.secure_url,
      publicId: result.public_id,
      owner: req.userId,
      tags: tagArray,
    });

    const populated = await image.populate("owner", "name email avatar");
    res.status(201).json(populated);
  } catch (err) {
    console.error("❌ Upload error:", err);
    res.status(500).json({ message: err.message || "Upload failed" });
  }
});

// ---------- Get all images (with search/filter) ----------
router.get("/", async (req, res) => {
  try {
    const { q, tag } = req.query;
    const filter = {};

    if (tag) {
      filter.tags = tag.toLowerCase();
    }
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { tags: { $regex: q, $options: "i" } },
      ];
    }

    const images = await Image.find(filter)
      .sort({ createdAt: -1 })
      .populate("owner", "name email avatar")
      .limit(100);

    res.json(images);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------- Following feed ----------
router.get("/feed/following", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("following");
    if (!user) return res.status(404).json({ message: "User not found" });

    const images = await Image.find({
      owner: { $in: user.following },
    })
      .sort({ createdAt: -1 })
      .populate("owner", "name email avatar")
      .limit(100);

    res.json(images);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------- Get my images ----------
// IMPORTANT: this must come BEFORE "/:id", otherwise Express treats "mine" as an id
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


// ---------- Trending tags ----------
router.get("/tags/trending", async (req, res) => {
  try {
    const tags = await Image.aggregate([
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);
    res.json(tags.map((t) => ({ tag: t._id, count: t.count })));
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ---------- Get single image ----------
router.get("/:id", async (req, res) => {
  try {
    const image = await Image.findById(req.params.id).populate(
      "owner",
      "name email avatar bio"
    );
    if (!image) return res.status(404).json({ message: "Image not found" });
    res.json(image);
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

// ---------- Get comments ----------
router.get("/:id/comments", async (req, res) => {
  try {
    const comments = await Comment.find({ image: req.params.id })
      .sort({ createdAt: -1 })
      .populate("author", "name avatar");
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ---------- Add comment ----------
router.post("/:id/comments", auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Comment cannot be empty" });
    }
    if (text.length > 500) {
      return res.status(400).json({ message: "Comment too long (max 500 chars)" });
    }

    const image = await Image.findById(req.params.id);
    if (!image) return res.status(404).json({ message: "Image not found" });

    const comment = await Comment.create({
      text: text.trim(),
      image: req.params.id,
      author: req.userId,
    });

    const populated = await comment.populate("author", "name avatar");
    res.status(201).json(populated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------- Delete comment ----------
router.delete("/:id/comments/:commentId", auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const image = await Image.findById(req.params.id);
    const canDelete =
      comment.author.toString() === req.userId ||
      (image && image.owner.toString() === req.userId);

    if (!canDelete) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await comment.deleteOne();
    res.json({ message: "Comment deleted" });
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

    // Also delete any comments on this image
    await Comment.deleteMany({ image: image._id });

    await cloudinary.uploader.destroy(image.publicId);
    await image.deleteOne();
    res.json({ message: "Image deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;