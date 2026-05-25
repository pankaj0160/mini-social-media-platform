// ============================================================
// server.js — Entry point of the backend application
// This file sets up Express, connects to MongoDB, and registers
// all the API routes.
// ============================================================

const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

// Import route files
const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");
const commentRoutes = require("./routes/commentRoutes");
const userRoutes = require("./routes/userRoutes");

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// ─── Middleware ────────────────────────────────────────────
// Allow JSON bodies in requests
app.use(express.json());

// Enable CORS so the frontend (different origin) can call the API
app.use(
  cors({
    origin: "*", // In production, replace with your actual frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ─── Routes ───────────────────────────────────────────────
// Each group of routes is mounted at its own path prefix
app.use("/api/auth", authRoutes);       // Register / Login
app.use("/api/users", userRoutes);      // Profile, Follow, Unfollow
app.use("/api/posts", postRoutes);      // CRUD + Like/Unlike
app.use("/api/comments", commentRoutes); // Add / Delete comments

// ─── Health check ─────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ message: "Mini Social Media API is running 🚀" });
});

// ─── Global error handler ─────────────────────────────────
// Catches any errors thrown inside route handlers
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong", error: err.message });
});

// ─── Start server ─────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
