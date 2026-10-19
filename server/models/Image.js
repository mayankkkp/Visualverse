const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    tags: [{ type: String, lowercase: true, trim: true }],
  },
  { timestamps: true }
);

// Text index for search across title, description, tags
imageSchema.index({ title: "text", description: "text", tags: "text" });

module.exports = mongoose.model("Image", imageSchema);