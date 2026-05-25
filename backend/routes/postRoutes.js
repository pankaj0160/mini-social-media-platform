// ============================================================
// routes/postRoutes.js
//
// IMPORTANT: The /like/:id and /unlike/:id routes MUST be
// declared BEFORE /:id, otherwise Express will try to match
// "like" as the :id parameter.
// ============================================================

const express = require("express");
const router = express.Router();
const {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
} = require("../controllers/postController");
const { protect } = require("../middleware/authMiddleware");

// All post routes require authentication
router.use(protect);

router.post("/", createPost);           // Create a post
router.get("/", getAllPosts);           // Get all posts (feed)
router.put("/like/:id", likePost);      // Like a post   ← must be before /:id
router.put("/unlike/:id", unlikePost);  // Unlike a post ← must be before /:id
router.get("/:id", getPostById);        // Get single post
router.put("/:id", updatePost);         // Edit a post
router.delete("/:id", deletePost);      // Delete a post

module.exports = router;
