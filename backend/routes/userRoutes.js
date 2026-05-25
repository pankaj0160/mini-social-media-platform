// ============================================================
// routes/userRoutes.js
// GET  /api/users/profile/:id  — view a user's profile
// PUT  /api/users/follow/:id   — follow a user
// PUT  /api/users/unfollow/:id — unfollow a user
// GET  /api/users/search       — search users by username
// ============================================================

const express = require("express");
const router = express.Router();
const {
  getUserProfile,
  followUser,
  unfollowUser,
  searchUsers,
  updateBio,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

// Public route — anyone can view a profile
router.get("/profile/:id", protect, getUserProfile);

// Protected routes — must be logged in
router.put("/follow/:id", protect, followUser);
router.put("/unfollow/:id", protect, unfollowUser);
router.put("/bio", protect, updateBio);
router.get("/search", protect, searchUsers);

module.exports = router;
