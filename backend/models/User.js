// ============================================================
// models/User.js — Mongoose schema for users
// ============================================================

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    // Unique display name shown across the platform
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username cannot exceed 30 characters"],
    },

    // Used for login — must be unique
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, "Please enter a valid email"],
    },

    // Stored as a bcrypt hash — NEVER store plain text passwords
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },

    // Short description the user can write about themselves
    bio: {
      type: String,
      default: "",
      maxlength: [200, "Bio cannot exceed 200 characters"],
    },

    // URL to the user's avatar image (placeholder by default)
    avatar: {
      type: String,
      default: "",
    },

    // Array of User _id values — people who follow THIS user
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Array of User _id values — people THIS user follows
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    // Automatically adds createdAt and updatedAt fields
    timestamps: true,
  }
);

// ─── Pre-save hook: hash password before saving ────────────
// This runs automatically before every .save() call.
// We only re-hash if the password field was actually modified.
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  // Salt rounds = 10 → a good balance of security and speed
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ─── Instance method: compare a plain password to the hash ──
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
