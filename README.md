# VisualVerse

A full-stack visual content platform where creators share images, discover work from others, and build a following — with AI-powered auto-tagging built in.

**Live demo:** https://visualverse-client.onrender.com

---

## Features

### For users
- **Authentication** — Email + password signup, Google OAuth, password reset via email
- **Upload images** — Drag-and-drop UI, automatic Cloudinary optimization, tag suggestions
- **AI auto-tagging** — MobileNet v2 (TensorFlow.js) analyzes uploads in-browser and suggests relevant tags
- **Discover feed** — Masonry grid, search across titles/descriptions/tags, trending tags
- **Following feed** — See images from creators you follow
- **Image detail pages** — Full-size view, likes, comments, clickable tags and author profiles
- **Public profiles** — View any creator's work, follower/following counts, follow button
- **Account management** — Edit name/bio, delete your images and comments

### Under the hood
- **JWT authentication** with session fallback for OAuth
- **Session store** in MongoDB (survives server restarts)
- **Cloudinary** for image storage with automatic width limiting (1600px)
- **Brevo** transactional email for password resets
- **MongoDB text search** across multiple fields

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 18, React Router v6, Material UI v6, Framer Motion, TensorFlow.js |
| **Backend** | Node.js, Express, Passport (Google OAuth), Multer, Nodemailer |
| **Database** | MongoDB Atlas, Mongoose |
| **Storage** | Cloudinary |
| **Email** | Brevo (transactional email API) |
| **AI** | MobileNet v2 via TensorFlow.js (runs client-side) |
| **Deployment** | Render (Static Site + Web Service) |

---
