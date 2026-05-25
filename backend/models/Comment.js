// ============================================================
// models/Comment.js — Mongoose schema for comments
// ============================================================

const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    // The user who wrote this comment
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // The post this comment belongs to
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },

    // The comment text itself
    text: {
      type: String,
      required: [true, "Comment text is required"],
      maxlength: [300, "Comment cannot exceed 300 characters"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Comment", commentSchema);
