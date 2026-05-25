// ============================================================
// js/posts.js
//
// Powers the main feed page (index.html):
// - Loads and renders all posts
// - Create post form
// - Like / Unlike
// - Add / Delete comments
// - Edit / Delete own posts
// - Logout
// ============================================================

// ─── Auth guard ───────────────────────────────────────────
if (!isLoggedIn()) {
  window.location.href = "login.html";
}

const currentUser = getCurrentUser();

// ─── DOM References ───────────────────────────────────────
const postsFeed = document.getElementById("postsFeed");
const postForm = document.getElementById("postForm");
const postContent = document.getElementById("postContent");
const charCount = document.getElementById("charCount");
const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");
const logoutBtn = document.getElementById("logoutBtn");
const userDisplayName = document.getElementById("userDisplayName");
const profileLink = document.getElementById("profileLink");

// ─── Setup navbar ─────────────────────────────────────────
if (userDisplayName) userDisplayName.textContent = currentUser.username;
if (profileLink) profileLink.href = `profile.html?id=${currentUser._id}`;

// ─── Logout ───────────────────────────────────────────────
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    clearUserSession();
    window.location.href = "login.html";
  });
}

// ─── Character counter ────────────────────────────────────
if (postContent && charCount) {
  postContent.addEventListener("input", () => {
    const remaining = 500 - postContent.value.length;
    charCount.textContent = `${remaining} characters remaining`;
    charCount.style.color = remaining < 50 ? "#e74c3c" : "#888";
  });
}

// ══════════════════════════════════════════════════════════
// RENDER POSTS
// ══════════════════════════════════════════════════════════

function renderPosts(posts) {
  if (!postsFeed) return;
  if (posts.length === 0) {
    postsFeed.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">✦</div>
        <p>No posts yet. Be the first to share something!</p>
      </div>`;
    return;
  }
  postsFeed.innerHTML = posts.map((post) => buildPostCard(post)).join("");
  attachPostListeners();
}

function buildPostCard(post) {
  const isOwner = post.user._id === currentUser._id;
  const hasLiked = post.likes.includes(currentUser._id);
  const timeAgo = formatTime(post.createdAt);
  const avatarLetter = post.user.username.charAt(0).toUpperCase();
  const avatarColor = stringToColor(post.user.username);
  const commentsHtml = post.comments.map((c) => buildCommentHtml(c)).join("");

  return `
    <article class="post-card" data-post-id="${post._id}">
      <div class="post-header">
        <a href="profile.html?id=${post.user._id}" class="post-author-link">
          <div class="avatar" style="background:${avatarColor}">${avatarLetter}</div>
          <div class="post-meta">
            <span class="post-username">@${post.user.username}</span>
            <span class="post-time">${timeAgo}</span>
          </div>
        </a>
        ${isOwner ? `
          <div class="post-actions-menu">
            <button class="btn-icon edit-post-btn" data-post-id="${post._id}" data-content="${escapeHtml(post.content)}" title="Edit">✎</button>
            <button class="btn-icon delete-post-btn" data-post-id="${post._id}" title="Delete">✕</button>
          </div>` : ""}
      </div>
      <div class="post-body">
        <p class="post-content">${escapeHtml(post.content)}</p>
        ${post.image ? `<img src="${post.image}" class="post-image" alt="Post image">` : ""}
      </div>
      <div class="post-footer">
        <button class="btn-like ${hasLiked ? "liked" : ""}" data-post-id="${post._id}">
          ${hasLiked ? "♥" : "♡"} <span class="like-count">${post.likes.length}</span>
        </button>
        <button class="btn-comment-toggle" data-post-id="${post._id}">
          💬 <span>${post.comments.length}</span>
        </button>
      </div>
      <div class="comments-section" id="comments-${post._id}" style="display:none;">
        <div class="comments-list" id="comments-list-${post._id}">${commentsHtml}</div>
        <form class="comment-form" data-post-id="${post._id}">
          <input type="text" class="comment-input" placeholder="Write a comment…" maxlength="300" required />
          <button type="submit" class="btn-primary btn-sm">Post</button>
        </form>
      </div>
    </article>`;
}

function buildCommentHtml(comment) {
  const isAuthor = comment.user._id === currentUser._id;
  const avatarLetter = comment.user.username.charAt(0).toUpperCase();
  const avatarColor = stringToColor(comment.user.username);
  return `
    <div class="comment" data-comment-id="${comment._id}">
      <a href="profile.html?id=${comment.user._id}" class="comment-author-link">
        <div class="avatar avatar-sm" style="background:${avatarColor}">${avatarLetter}</div>
      </a>
      <div class="comment-body">
        <a href="profile.html?id=${comment.user._id}" class="comment-username">@${comment.user.username}</a>
        <span class="comment-text">${escapeHtml(comment.text)}</span>
      </div>
      ${isAuthor ? `<button class="btn-icon delete-comment-btn" data-comment-id="${comment._id}">✕</button>` : ""}
    </div>`;
}

// ══════════════════════════════════════════════════════════
// EVENT DELEGATION
// ══════════════════════════════════════════════════════════

function attachPostListeners() {
  const feed = document.getElementById("postsFeed");
  if (!feed) return;

  // Clone to remove old listeners
  const newFeed = feed.cloneNode(true);
  feed.parentNode.replaceChild(newFeed, feed);

  newFeed.addEventListener("click", async (e) => {
    // Like / Unlike
    const likeBtn = e.target.closest(".btn-like");
    if (likeBtn) {
      const postId = likeBtn.dataset.postId;
      const isLiked = likeBtn.classList.contains("liked");
      try {
        const result = isLiked ? await unlikePost(postId) : await likePost(postId);
        likeBtn.classList.toggle("liked");
        likeBtn.querySelector(".like-count").textContent = result.likes;
        likeBtn.childNodes[0].textContent = likeBtn.classList.contains("liked") ? "♥ " : "♡ ";
      } catch (err) { alert(err.message); }
      return;
    }

    // Toggle comments
    const commentToggle = e.target.closest(".btn-comment-toggle");
    if (commentToggle) {
      const postId = commentToggle.dataset.postId;
      const section = document.getElementById(`comments-${postId}`);
      if (section) {
        const isHidden = section.style.display === "none";
        section.style.display = isHidden ? "block" : "none";
        if (isHidden) section.querySelector(".comment-input")?.focus();
      }
      return;
    }

    // Delete post
    const deletePostBtn = e.target.closest(".delete-post-btn");
    if (deletePostBtn) {
      if (!confirm("Delete this post?")) return;
      try {
        await deletePost(deletePostBtn.dataset.postId);
        deletePostBtn.closest(".post-card").remove();
      } catch (err) { alert(err.message); }
      return;
    }

    // Edit post
    const editPostBtn = e.target.closest(".edit-post-btn");
    if (editPostBtn) {
      const postId = editPostBtn.dataset.postId;
      const currentContent = editPostBtn.dataset.content;
      const newContent = prompt("Edit your post:", currentContent);
      if (!newContent || newContent === currentContent) return;
      try {
        const updated = await updatePost(postId, newContent);
        const contentEl = editPostBtn.closest(".post-card").querySelector(".post-content");
        if (contentEl) contentEl.textContent = updated.content;
        editPostBtn.dataset.content = updated.content;
      } catch (err) { alert(err.message); }
      return;
    }

    // Delete comment
    const deleteCommentBtn = e.target.closest(".delete-comment-btn");
    if (deleteCommentBtn) {
      const commentEl = deleteCommentBtn.closest(".comment");
      const postCard = deleteCommentBtn.closest(".post-card");
      const postId = postCard.dataset.postId;
      try {
        await deleteComment(deleteCommentBtn.dataset.commentId);
        commentEl.remove();
        // Update comment count badge
        const badge = postCard.querySelector(`.btn-comment-toggle span`);
        if (badge) badge.textContent = Math.max(0, parseInt(badge.textContent || 0) - 1);
      } catch (err) { alert(err.message); }
      return;
    }
  });

  // Submit comment
  newFeed.addEventListener("submit", async (e) => {
    const commentForm = e.target.closest(".comment-form");
    if (!commentForm) return;
    e.preventDefault();
    const postId = commentForm.dataset.postId;
    const input = commentForm.querySelector(".comment-input");
    const text = input.value.trim();
    if (!text) return;
    try {
      const comment = await addComment(postId, text);
      const commentsList = document.getElementById(`comments-list-${postId}`);
      if (commentsList) commentsList.insertAdjacentHTML("beforeend", buildCommentHtml(comment));
      input.value = "";
      const badge = document.querySelector(`.btn-comment-toggle[data-post-id="${postId}"] span`);
      if (badge) badge.textContent = parseInt(badge.textContent || 0) + 1;
    } catch (err) { alert(err.message); }
  });
}

// ══════════════════════════════════════════════════════════
// CREATE POST
// ══════════════════════════════════════════════════════════
if (postForm) {
  postForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const content = postContent.value.trim();
    if (!content) return;
    const submitBtn = postForm.querySelector("button[type=submit]");
    submitBtn.disabled = true;
    submitBtn.textContent = "Posting…";
    try {
      const newPost = await createPost(content);
      postContent.value = "";
      if (charCount) charCount.textContent = "500 characters remaining";
      const feed = document.getElementById("postsFeed");
      feed.querySelector(".empty-state")?.remove();
      feed.insertAdjacentHTML("afterbegin", buildPostCard(newPost));
      attachPostListeners();
    } catch (err) {
      alert(err.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Share";
    }
  });
}

// ══════════════════════════════════════════════════════════
// SEARCH
// ══════════════════════════════════════════════════════════
let searchTimeout;
if (searchInput) {
  searchInput.addEventListener("input", () => {
    clearTimeout(searchTimeout);
    const q = searchInput.value.trim();
    if (!q) { searchResults.innerHTML = ""; searchResults.style.display = "none"; return; }
    searchTimeout = setTimeout(async () => {
      try {
        const users = await searchUsers(q);
        searchResults.innerHTML = users.length === 0
          ? `<div class="search-item">No users found</div>`
          : users.map(u => `
              <a href="profile.html?id=${u._id}" class="search-item">
                <div class="avatar avatar-sm" style="background:${stringToColor(u.username)}">${u.username.charAt(0).toUpperCase()}</div>
                <span>@${u.username}</span>
              </a>`).join("");
        searchResults.style.display = "block";
      } catch (err) { console.error(err); }
    }, 300);
  });

  document.addEventListener("click", (e) => {
    if (!searchInput.contains(e.target)) searchResults.style.display = "none";
  });
}

// ══════════════════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════════════════
async function loadFeed() {
  if (!postsFeed) return;
  postsFeed.innerHTML = `<div class="loading-spinner"><div class="spinner"></div><p>Loading posts…</p></div>`;
  try {
    const posts = await getAllPosts();
    renderPosts(posts);
  } catch (err) {
    postsFeed.innerHTML = `<div class="error-state">⚠ Failed to load posts: ${err.message}</div>`;
  }
}
loadFeed();

// ══════════════════════════════════════════════════════════
// UTILITIES
// ══════════════════════════════════════════════════════════
function formatTime(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function escapeHtml(str = "") {
  return str
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return `hsl(${Math.abs(hash) % 360}, 55%, 50%)`;
}
