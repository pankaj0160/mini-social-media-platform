// ============================================================
// routes/authRoutes.js
// POST /api/auth/register  — create a new account
// POST /api/auth/login     — log in and receive a JWT
// ============================================================

const express = require("express");
const router = express.Router();
const { registerUser, loginUser } = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/login", loginUser);

module.exports = router;
