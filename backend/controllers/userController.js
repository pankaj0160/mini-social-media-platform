// ============================================================
// controllers/userController.js
//
// Handles fetching user profiles and the follow/unfollow system.
// All routes here are protected — the user must be logged in.
// ============================================================

const User = require("../models/User");
const Post = require("../models/Post");

// ─── GET /api/users/profile/:id ───────────────────────────
/**
 * getUserProfile
 * Returns a user's public profile info plus all their posts.
 */
const getUserProfile = async (req, res) => {
  try {
    // Find the user by the :id URL parameter, excluding their password
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("followers", "_id username avatar")   // Expand followers to show names
      .populate("following", "_id username avatar");  // Expand following to show names

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch all posts this user has created, newest first
    const posts = await Post.find({ user: req.params.id })
      .sort({ createdAt: -1 })
      .populate("user", "_id username avatar")
      .populate({
        path: "comments",
        populate: { path: "user", select: "_id username avatar" },
      });

    res.json({ user, posts });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── PUT /api/users/follow/:id ────────────────────────────
/**
 * followUser
 * The logged-in user (req.user) follows the user with :id.
 * Prevents following yourself or following the same person twice.
 */
const followUser = async (req, res) => {
  try {
    // The user to follow
    const userToFollow = await User.findById(req.params.id);
    // The currently logged-in user
    const currentUser = await User.findById(req.user._id);

    if (!userToFollow) {
      return res.status(404).json({ message: "User not found" });
    }

    // Can't follow yourself
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    // Check if already following
    if (currentUser.following.includes(req.params.id)) {
      return res.status(400).json({ message: "You already follow this user" });
    }

    // Add to the target user's followers list
    await User.findByIdAndUpdate(req.params.id, {
      $push: { followers: req.user._id },
    });

    // Add to the current user's following list
    await User.findByIdAndUpdate(req.user._id, {
      $push: { following: req.params.id },
    });

    res.json({ message: "User followed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── PUT /api/users/unfollow/:id ──────────────────────────
/**
 * unfollowUser
 * The logged-in user unfollows the user with :id.
 */
const unfollowUser = async (req, res) => {
  try {
    const userToUnfollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);

    if (!userToUnfollow) {
      return res.status(404).json({ message: "User not found" });
    }

    // Must already be following to unfollow
    if (!currentUser.following.includes(req.params.id)) {
      return res.status(400).json({ message: "You do not follow this user" });
    }

    // Remove from target user's followers
    await User.findByIdAndUpdate(req.params.id, {
      $pull: { followers: req.user._id },
    });

    // Remove from current user's following
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { following: req.params.id },
    });

    res.json({ message: "User unfollowed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── GET /api/users/search?q=query ────────────────────────
/**
 * searchUsers
 * Searches for users whose username contains the query string.
 * Uses a case-insensitive regex.
 */
const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);

    const users = await User.find({
      username: { $regex: q, $options: "i" },
    })
      .select("_id username avatar bio")
      .limit(10);

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── PUT /api/users/bio ───────────────────────────────────
/**
 * updateBio
 * Updates the bio for the currently logged-in user.
 */
const updateBio = async (req, res) => {
  try {
    const { bio } = req.body;

    if (!bio || typeof bio !== "string") {
      return res.status(400).json({ message: "Bio must be a non-empty string" });
    }

    if (bio.length > 200) {
      return res.status(400).json({ message: "Bio cannot exceed 200 characters" });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { bio: bio.trim() },
      { new: true }
    ).select("-password");

    res.json({ message: "Bio updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getUserProfile, followUser, unfollowUser, searchUsers, updateBio };
