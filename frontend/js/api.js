// ============================================================
// js/api.js
//
// Central module for all backend API calls.
// Every function here calls fetch() with the correct headers
// and returns the parsed JSON (or throws an error).
//
// Why centralize? So when your backend URL changes (e.g. during
// deployment), you only need to update BASE_URL in one place.
// ============================================================

// ─── Configuration ────────────────────────────────────────
// Change this to your deployed backend URL in production
const BASE_URL = (window.APP_CONFIG?.API_BASE_URL || "http://localhost:5000") + "/api";

// ─── Helper: build Authorization header ───────────────────
/**
 * getAuthHeaders()
 * Returns the headers object needed for protected API calls.
 * Reads the JWT from localStorage where it was saved at login.
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

// ─── Helper: handle fetch response ────────────────────────
/**
 * handleResponse(res)
 * If the HTTP status indicates an error (4xx, 5xx), parse the
 * error body and throw so callers can catch it.
 */
const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Something went wrong");
  }
  return data;
};

// ══════════════════════════════════════════════════════════
// AUTH
// ══════════════════════════════════════════════════════════

/**
 * register(username, email, password)
 * Creates a new account and returns { user, token }.
 */
const register = async (username, email, password) => {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });
  return handleResponse(res);
};

/**
 * login(email, password)
 * Authenticates and returns { user, token }.
 */
const login = async (email, password) => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(res);
};

// ══════════════════════════════════════════════════════════
// POSTS
// ══════════════════════════════════════════════════════════

const getAllPosts = async () => {
  const res = await fetch(`${BASE_URL}/posts`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

const createPost = async (content) => {
  const res = await fetch(`${BASE_URL}/posts`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ content }),
  });
  return handleResponse(res);
};

const updatePost = async (postId, content) => {
  const res = await fetch(`${BASE_URL}/posts/${postId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ content }),
  });
  return handleResponse(res);
};

const deletePost = async (postId) => {
  const res = await fetch(`${BASE_URL}/posts/${postId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

const likePost = async (postId) => {
  const res = await fetch(`${BASE_URL}/posts/like/${postId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

const unlikePost = async (postId) => {
  const res = await fetch(`${BASE_URL}/posts/unlike/${postId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

// ══════════════════════════════════════════════════════════
// COMMENTS
// ══════════════════════════════════════════════════════════

const addComment = async (postId, text) => {
  const res = await fetch(`${BASE_URL}/comments/${postId}`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ text }),
  });
  return handleResponse(res);
};

const deleteComment = async (commentId) => {
  const res = await fetch(`${BASE_URL}/comments/${commentId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

// ══════════════════════════════════════════════════════════
// USERS
// ══════════════════════════════════════════════════════════

const getUserProfile = async (userId) => {
  const res = await fetch(`${BASE_URL}/users/profile/${userId}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

const followUser = async (userId) => {
  const res = await fetch(`${BASE_URL}/users/follow/${userId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

const unfollowUser = async (userId) => {
  const res = await fetch(`${BASE_URL}/users/unfollow/${userId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

const searchUsers = async (query) => {
  const res = await fetch(`${BASE_URL}/users/search?q=${encodeURIComponent(query)}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};

const updateBio = async (bio) => {
  const res = await fetch(`${BASE_URL}/users/bio`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ bio }),
  });
  return handleResponse(res);
};

// ─── LocalStorage helpers ─────────────────────────────────

/** Save user data and token after login/register */
const saveUserSession = (data) => {
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify({
    _id: data._id,
    username: data.username,
    email: data.email,
    bio: data.bio,
    avatar: data.avatar,
    followers: data.followers,
    following: data.following,
  }));
};

/** Read the current user from localStorage */
const getCurrentUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

/** Clear session on logout */
const clearUserSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

/** Check if user is logged in */
const isLoggedIn = () => !!localStorage.getItem("token");
