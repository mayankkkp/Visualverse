const express = require("express");
const User = require("../models/User");
const Image = require("../models/Image");

const router = express.Router();

// ---------- Get public profile ----------
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "name email avatar bio createdAt"
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    const [images, likesReceived] = await Promise.all([
      Image.find({ owner: user._id })
        .sort({ createdAt: -1 })
        .populate("owner", "name avatar"),
      Image.aggregate([
        { $match: { owner: user._id } },
        { $project: { count: { $size: "$likes" } } },
        { $group: { _id: null, total: { $sum: "$count" } } },
      ]),
    ]);

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        createdAt: user.createdAt,
      },
      stats: {
        images: images.length,
        likes: likesReceived[0]?.total || 0,
      },
      images,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;