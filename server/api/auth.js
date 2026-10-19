const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { body, validationResult } = require("express-validator");
const passport = require("passport");
const Brevo = require("@getbrevo/brevo");
const { BrevoClient } = require("@getbrevo/brevo");
const brevo = new BrevoClient({ apiKey: process.env.BREVO_API_KEY });

const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d"
  });

const sendEmail = async ({ to, subject, html }) => {
  await brevo.transactionalEmails.sendTransacEmail({
    sender: { name: "VisualVerse", email: "mayankpal2311@gmail.com" },
    to: [{ email: to }],
    subject: subject,
    htmlContent: html,
  });
};

// ---------- Signup ----------
router.post(
  "/signup",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters")
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password } = req.body;
    try {
      const existing = await User.findOne({ email });
      if (existing) return res.status(400).json({ message: "Email already registered" });

      const hashed = await bcrypt.hash(password, 10);
      const user = await User.create({ name, email, password: hashed });
      const token = signToken(user._id);

      res.status(201).json({
        token,
        user: { id: user._id, name: user.name, email: user.email }
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// ---------- Login ----------
router.post(
  "/login",
  [
    body("email").isEmail(),
    body("password").notEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user || !user.password) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(400).json({ message: "Invalid credentials" });

      const token = signToken(user._id);
      res.json({
        token,
        user: { id: user._id, name: user.name, email: user.email }
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// ---------- Get current user ----------
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password -resetPasswordToken -resetPasswordExpires");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ---------- Update profile ----------
router.put("/me", auth, async (req, res) => {
  try {
    const { name, bio, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { ...(name && { name }), ...(bio !== undefined && { bio }), ...(avatar && { avatar }) },
      { new: true }
    ).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ---------- Forgot password ----------
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });

    // Always respond the same way for security
    const genericResponse = {
      message: "If that email is registered, a reset link has been sent."
    };

    if (!user) return res.json(genericResponse);

    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;
    console.log("🔗 Reset URL:", resetUrl);  // ⬅️ so you can test manually

    try {
      await sendEmail({
        to: user.email,
        subject: "Reset your VisualVerse password",
        html: `
          <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #0A0A0A;">
            <h2 style="font-size: 24px; font-weight: 600; letter-spacing: -0.02em; margin: 0 0 8px;">
              Reset your password
            </h2>
            <p style="color: #6B7280; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
              Click the button below to set a new password. This link expires in 1 hour.
            </p>
            <a href="${resetUrl}" style="display: inline-block; background: #0A0A0A; color: #FFFFFF; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500; font-size: 14px;">
              Reset password
            </a>
            <p style="color: #9CA3AF; font-size: 12px; line-height: 1.6; margin: 24px 0 0;">
              If you didn't request this, you can safely ignore this email.
            </p>
            <p style="color: #9CA3AF; font-size: 12px; line-height: 1.6; margin: 8px 0 0; word-break: break-all;">
              Or paste this URL: ${resetUrl}
            </p>
          </div>
        `,
      });
      console.log("✅ Email sent to", user.email);
    } catch (mailErr) {
      console.error("❌ Email send failed:", mailErr.message);
      // Don't fail the request — still return success for security
    }

    res.json(genericResponse);
  } catch (err) {
    console.error("❌ Forgot-password error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------- Reset password ----------
router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password || password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ---------- Google OAuth ----------
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"], prompt: "select_account" }));

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: `${process.env.CLIENT_URL}/login` }),
  (req, res) => {
    const token = signToken(req.user._id);
    const userData = {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email
    };
    const params = new URLSearchParams({
      token,
      user: JSON.stringify(userData)
    });
    res.redirect(`${process.env.CLIENT_URL}/login-success?${params.toString()}`);
  }
);

module.exports = router;