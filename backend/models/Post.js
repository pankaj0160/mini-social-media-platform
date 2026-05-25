// ============================================================
// models/Post.js — Mongoose schema for posts
// ============================================================

const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    // Reference to the User who created this post
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",        // Tells Mongoose to populate from the User collection
      required: true,
    },

    // The text body of the post
    content: {
      type: String,
      required: [true, "Post content is required"],
      maxlength: [500, "Post cannot exceed 500 characters"],
    },

    // Optional image URL attached to the post
    image: {
      type: String,
      default: "",
    },

    // Array of User _id values who have liked this post
    // Using a Set-like pattern: each user can only like once
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Array of Comment document _id references
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

module.exports = mongoose.model("Post", postSchema);
