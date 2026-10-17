const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const session = require("express-session");
const MongoStore = require("connect-mongo");
const cors = require("cors");

const authRoutes = require("./api/auth");
const imageUploadRoutes = require("./api/imageupload");
const User = require("./models/User");

const app = express();

// ---- Environment validation ----
const requiredEnvVars = [
  "MONGODB_URI", "SESSION_SECRET", "JWT_SECRET",
  "GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET",
  "CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"
];
requiredEnvVars.forEach((v) => {
  if (!process.env[v]) {
    console.error(`❌ Missing required env var: ${v}`);
    process.exit(1);
  }
});

// ---- CORS ----
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:3000"
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) cb(null, true);
    else cb(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// ---- Body parsing ----
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ---- Trust proxy (Render) ----
app.set("trust proxy", 1);

// ---- Session ----
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: "sessions",
    ttl: 14 * 24 * 60 * 60
  }),
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 14 * 24 * 60 * 60 * 1000,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
  }
}));

// ---- Passport ----
app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `${process.env.SERVER_URL}/auth/google/callback`,
  scope: ["profile", "email"]
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails?.[0]?.value;
    let user = await User.findOne({ googleId: profile.id });
    if (!user) {
      if (email) {
        user = await User.findOne({ email });
        if (user) {
          user.googleId = profile.id;
          await user.save();
          return done(null, user);
        }
      }
      user = await User.create({
        googleId: profile.id,
        name: profile.displayName,
        email,
        avatar: profile.photos?.[0]?.value || ""
      });
    }
    done(null, user);
  } catch (err) {
    done(err, null);
  }
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) { done(err, null); }
});

// ---- Routes ----
app.use("/auth", authRoutes);
app.use("/api/images", imageUploadRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 404
app.use((req, res) => res.status(404).json({ message: "Route not found" }));

// Error handler
app.use((err, req, res, next) => {
  console.error("❌ Error:", err);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

// ---- DB + start ----
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1);
  });