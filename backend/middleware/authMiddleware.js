// ============================================================
// middleware/authMiddleware.js
//
// This middleware protects routes that require a logged-in user.
// It reads the JWT from the Authorization header, verifies it,
// and attaches the user's ID to req.user so controllers can use it.
// ============================================================

const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  // JWT is sent in the "Authorization" header as: "Bearer <token>"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Extract the token (split off the "Bearer " prefix)
      token = req.headers.authorization.split(" ")[1];

      // Verify the token using our secret key
      // If invalid or expired, jwt.verify() throws an error
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user info to the request (excluding the password)
      // Now any controller that runs after this middleware has req.user
      req.user = await User.findById(decoded.id).select("-password");

      next(); // Pass control to the next middleware / route handler
    } catch (error) {
      console.error("Token verification failed:", error.message);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Not authorized, no token provided" });
  }
};

module.exports = { protect };
