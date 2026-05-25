// ============================================================
// controllers/authController.js
//
// Handles user registration and login.
// On success, returns a JWT token the frontend stores and sends
// with every subsequent request.
// ============================================================

const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ─── Helper: generate a signed JWT ────────────────────────
/**
 * generateToken(id)
 * Creates a JWT that encodes the user's MongoDB _id.
 * Expires in 30 days — the user must log in again after that.
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// ─── POST /api/auth/register ──────────────────────────────
/**
 * registerUser
 * 1. Check that username/email aren't already taken
 * 2. Create the user (password gets hashed by the pre-save hook)
 * 3. Return the new user + a JWT
 */
const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Basic field validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check for existing email
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Check for existing username
    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return res.status(400).json({ message: "Username already taken" });
    }

    // Create the user document (password is hashed automatically)
    const user = await User.create({ username, email, password });

    // Respond with the user data and a fresh JWT
    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      bio: user.bio,
      avatar: user.avatar,
      followers: user.followers,
      following: user.following,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── POST /api/auth/login ─────────────────────────────────
/**
 * loginUser
 * 1. Find user by email
 * 2. Compare the submitted password with the stored hash
 * 3. Return user data + JWT on success
 */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Look up user by email
    const user = await User.findOne({ email });

    // matchPassword() is defined in the User model
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        avatar: user.avatar,
        followers: user.followers,
        following: user.following,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { registerUser, loginUser };
