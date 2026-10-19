const express = require("express");
const User = require("../models/User");
const Image = require("../models/Image");
const auth = require("../middleware/auth");

const router = express.Router();

// ---------- Get public profile ----------
router.get("/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "name email avatar bio followers following createdAt"
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

    const isFollowing = user.followers.some(
      (id) => id.toString() === req.userId
    );

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
        followers: user.followers.length,
        following: user.following.length,
      },
      isFollowing,
      images,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------- Follow / unfollow ----------
router.post("/:id/follow", auth, async (req, res) => {
  try {
    const targetId = req.params.id;

    if (targetId === req.userId) {
      return res.status(400).json({ message: "Cannot follow yourself" });
    }

    const target = await User.findById(targetId);
    if (!target) return res.status(404).json({ message: "User not found" });

    const currentUser = await User.findById(req.userId);

    const alreadyFollowing = currentUser.following.some(
      (id) => id.toString() === targetId
    );

    if (alreadyFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter(
        (id) => id.toString() !== targetId
      );
      target.followers = target.followers.filter(
        (id) => id.toString() !== req.userId
      );
    } else {
      // Follow
      currentUser.following.push(targetId);
      target.followers.push(req.userId);
    }

    await Promise.all([currentUser.save(), target.save()]);

    res.json({
      following: !alreadyFollowing,
      followersCount: target.followers.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------- Get followers list ----------
router.get("/:id/followers", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate(
      "followers",
      "name avatar bio"
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user.followers);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ---------- Get following list ----------
router.get("/:id/following", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate(
      "following",
      "name avatar bio"
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user.following);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;