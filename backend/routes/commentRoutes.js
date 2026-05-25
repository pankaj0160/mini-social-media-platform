// ============================================================
// routes/commentRoutes.js
// POST   /api/comments/:postId       — add a comment to a post
// DELETE /api/comments/:commentId    — delete a comment
// ============================================================

const express = require("express");
const router = express.Router();
const { addComment, deleteComment } = require("../controllers/commentController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect); // All comment actions require login

router.post("/:postId", addComment);
router.delete("/:commentId", deleteComment);

module.exports = router;
