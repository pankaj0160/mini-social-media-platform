// ============================================================
// controllers/commentController.js
//
// Adding and deleting comments on posts.
// ============================================================

const Comment = require("../models/Comment");
const Post = require("../models/Post");

// ─── POST /api/comments/:postId ──────────────────────────
/**
 * addComment
 * Creates a new comment, then pushes its _id into the post's
 * comments array so the relationship is stored on both sides.
 */
const addComment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Create the comment document
    const comment = await Comment.create({
      user: req.user._id,
      post: req.params.postId,
      text,
    });

    // Push the new comment's _id into the post so it shows up
    // when the post is populated later
    post.comments.push(comment._id);
    await post.save();

    // Populate user details before returning
    const populated = await comment.populate("user", "username avatar");
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── DELETE /api/comments/:commentId ─────────────────────
/**
 * deleteComment
 * Deletes a comment and removes it from the parent post's
 * comments array. Only the comment author can delete it.
 */
const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Authorization: only the author can delete
    if (comment.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this comment" });
    }

    // Remove the comment _id from the parent post's array
    await Post.findByIdAndUpdate(comment.post, {
      $pull: { comments: comment._id },
    });

    // Delete the comment document
    await comment.deleteOne();

    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { addComment, deleteComment };
