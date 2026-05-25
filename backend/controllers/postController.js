// ============================================================
// controllers/postController.js
//
// Full CRUD for posts plus like / unlike functionality.
// All routes are protected — req.user is set by authMiddleware.
// ============================================================

const Post = require("../models/Post");
const Comment = require("../models/Comment");

// ─── Helper: populate a post with user + comments ─────────
const populatePost = (query) =>
  query
    .populate("user", "_id username avatar")
    .populate({
      path: "comments",
      populate: { path: "user", select: "_id username avatar" },
    });

// ─── POST /api/posts ──────────────────────────────────────
/**
 * createPost — Create a new post
 */
const createPost = async (req, res) => {
  try {
    const { content, image } = req.body;

    if (!content) {
      return res.status(400).json({ message: "Post content is required" });
    }

    const post = await Post.create({
      user: req.user._id,  // The logged-in user owns this post
      content,
      image: image || "",
    });

    // Populate and return the full post object
    const populated = await populatePost(Post.findById(post._id));
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── GET /api/posts ───────────────────────────────────────
/**
 * getAllPosts — Return all posts, newest first
 */
const getAllPosts = async (req, res) => {
  try {
    const posts = await populatePost(Post.find().sort({ createdAt: -1 }));
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── GET /api/posts/:id ───────────────────────────────────
/**
 * getPostById — Return a single post by its _id
 */
const getPostById = async (req, res) => {
  try {
    const post = await populatePost(Post.findById(req.params.id));

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── PUT /api/posts/:id ───────────────────────────────────
/**
 * updatePost — Edit the content of an existing post.
 * Only the post's owner can edit it.
 */
const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Authorization check: only the owner can edit
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to edit this post" });
    }

    post.content = req.body.content || post.content;
    post.image = req.body.image ?? post.image;
    await post.save();

    const updated = await populatePost(Post.findById(post._id));
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── DELETE /api/posts/:id ────────────────────────────────
/**
 * deletePost — Delete a post and all its comments.
 * Only the post's owner can delete it.
 */
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this post" });
    }

    // Delete all comments that belong to this post
    await Comment.deleteMany({ post: post._id });

    // Delete the post itself
    await post.deleteOne();

    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── PUT /api/posts/like/:id ──────────────────────────────
/**
 * likePost — Add the current user to the post's likes array.
 * Prevents double-liking.
 */
const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.likes.includes(req.user._id)) {
      return res.status(400).json({ message: "You already liked this post" });
    }

    post.likes.push(req.user._id);
    await post.save();

    res.json({ likes: post.likes.length, message: "Post liked" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── PUT /api/posts/unlike/:id ────────────────────────────
/**
 * unlikePost — Remove the current user from the post's likes array.
 */
const unlikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (!post.likes.includes(req.user._id)) {
      return res.status(400).json({ message: "You have not liked this post" });
    }

    post.likes = post.likes.filter(
      (id) => id.toString() !== req.user._id.toString()
    );
    await post.save();

    res.json({ likes: post.likes.length, message: "Post unliked" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
};
