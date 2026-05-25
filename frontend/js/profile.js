// ============================================================
// js/profile.js — Profile page logic
// ============================================================

if (!isLoggedIn()) { window.location.href = "login.html"; }

const currentUser = getCurrentUser();
const params = new URLSearchParams(window.location.search);
const profileUserId = params.get("id") || currentUser._id;
const isOwnProfile = profileUserId === currentUser._id;

const logoutBtn = document.getElementById("logoutBtn");
const profileLink = document.getElementById("profileLink");
const userDisplayName = document.getElementById("userDisplayName");
const profileAvatar = document.getElementById("profileAvatar");
const profileUsername = document.getElementById("profileUsername");
const profileBio = document.getElementById("profileBio");
const profileFollowers = document.getElementById("profileFollowers");
const profileFollowing = document.getElementById("profileFollowing");
const followBtn = document.getElementById("followBtn");
const profilePosts = document.getElementById("profilePosts");
const editBioBtn = document.getElementById("editBioBtn");

if (userDisplayName) userDisplayName.textContent = currentUser.username;
if (profileLink) profileLink.href = `profile.html?id=${currentUser._id}`;
if (logoutBtn) { logoutBtn.addEventListener("click", () => { clearUserSession(); window.location.href = "login.html"; }); }

async function loadProfile() {
  try {
    const { user, posts } = await getUserProfile(profileUserId);
    const avatarLetter = user.username.charAt(0).toUpperCase();
    const avatarColor = stringToColor(user.username);
    if (profileAvatar) { profileAvatar.textContent = avatarLetter; profileAvatar.style.background = avatarColor; }
    if (profileUsername) profileUsername.textContent = "@" + user.username;
    if (profileBio) profileBio.textContent = user.bio || "No bio yet.";
    if (profileFollowers) profileFollowers.textContent = user.followers.length;
    if (profileFollowing) profileFollowing.textContent = user.following.length;

    // Show edit bio button only on own profile
    if (editBioBtn) {
      if (isOwnProfile) {
        editBioBtn.style.display = "inline-block";
        editBioBtn.addEventListener("click", async () => {
          const newBio = prompt("Edit your bio (max 200 characters):", user.bio || "");
          if (newBio === null) return; // Cancel
          if (newBio === user.bio) return; // No change
          if (newBio.length > 200) { alert("Bio cannot exceed 200 characters"); return; }
          try {
            const result = await updateBio(newBio);
            if (profileBio) profileBio.textContent = result.user.bio || "No bio yet.";
            user.bio = result.user.bio;
          } catch (err) { alert(err.message); }
        });
      } else {
        editBioBtn.style.display = "none";
      }
    }

    if (followBtn) {
      if (isOwnProfile) {
        followBtn.style.display = "none";
      } else {
        const isFollowing = user.followers.some(f => (f._id || f) === currentUser._id);
        setFollowButton(isFollowing);
        followBtn.addEventListener("click", async () => {
          const currently = followBtn.dataset.following === "true";
          const originalText = followBtn.textContent;
          followBtn.disabled = true;
          followBtn.textContent = currently ? "Unfollowing…" : "Following…";
          try {
            if (currently) {
              await unfollowUser(profileUserId);
              profileFollowers.textContent = parseInt(profileFollowers.textContent) - 1;
              setFollowButton(false);
            } else {
              await followUser(profileUserId);
              profileFollowers.textContent = parseInt(profileFollowers.textContent) + 1;
              setFollowButton(true);
            }
          } catch (err) {
            alert(err.message);
            followBtn.textContent = originalText;
          } finally {
            followBtn.disabled = false;
          }
        });
      }
    }
    renderProfilePosts(posts);
  } catch (err) {
    if (profilePosts) profilePosts.innerHTML = `<div class="error-state">Failed to load profile: ${err.message}</div>`;
  }
}

function setFollowButton(isFollowing) {
  if (!followBtn) return;
  followBtn.dataset.following = isFollowing;
  followBtn.textContent = isFollowing ? "Unfollow" : "Follow";
  followBtn.className = isFollowing ? "btn-secondary" : "btn-primary";
}

function renderProfilePosts(posts) {
  if (!profilePosts) return;
  if (posts.length === 0) {
    profilePosts.innerHTML = `<div class="empty-state"><div class="empty-icon">✦</div><p>${isOwnProfile ? "You haven't posted anything yet." : "No posts yet."}</p>${isOwnProfile ? '<a href="index.html" class="btn-primary" style="margin-top:1rem;display:inline-block;">Go to Feed</a>' : ""}</div>`;
    return;
  }
  profilePosts.innerHTML = posts.map(post => buildProfilePostCard(post)).join("");
  attachProfilePostListeners();
}

function buildProfilePostCard(post) {
  const isOwner = post.user._id === currentUser._id;
  const hasLiked = post.likes.includes(currentUser._id);
  const commentsHtml = post.comments.map(c => buildCommentHtml(c)).join("");
  return `
    <article class="post-card" data-post-id="${post._id}">
      <div class="post-header">
        <span class="post-time">${formatTime(post.createdAt)}</span>
        ${isOwner ? `<div class="post-actions-menu">
          <button class="btn-icon edit-post-btn" data-post-id="${post._id}" data-content="${escapeHtml(post.content)}" title="Edit">✎</button>
          <button class="btn-icon delete-post-btn" data-post-id="${post._id}" title="Delete">✕</button>
        </div>` : ""}
      </div>
      <div class="post-body"><p class="post-content">${escapeHtml(post.content)}</p>${post.image ? `<img src="${post.image}" class="post-image" alt="">` : ""}</div>
      <div class="post-footer">
        <button class="btn-like ${hasLiked ? "liked" : ""}" data-post-id="${post._id}">${hasLiked ? "♥" : "♡"} <span class="like-count">${post.likes.length}</span></button>
        <button class="btn-comment-toggle" data-post-id="${post._id}">💬 <span>${post.comments.length}</span></button>
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
  const avatarColor = stringToColor(comment.user.username);
  return `
    <div class="comment" data-comment-id="${comment._id}">
      <a href="profile.html?id=${comment.user._id}"><div class="avatar avatar-sm" style="background:${avatarColor}">${comment.user.username.charAt(0).toUpperCase()}</div></a>
      <div class="comment-body"><a href="profile.html?id=${comment.user._id}" class="comment-username">@${comment.user.username}</a><span class="comment-text">${escapeHtml(comment.text)}</span></div>
      ${isAuthor ? `<button class="btn-icon delete-comment-btn" data-comment-id="${comment._id}">✕</button>` : ""}
    </div>`;
}

function attachProfilePostListeners() {
  const container = document.getElementById("profilePosts");
  if (!container) return;
  container.addEventListener("click", async (e) => {
    const likeBtn = e.target.closest(".btn-like");
    if (likeBtn) {
      const isLiked = likeBtn.classList.contains("liked");
      try {
        const result = isLiked ? await unlikePost(likeBtn.dataset.postId) : await likePost(likeBtn.dataset.postId);
        likeBtn.classList.toggle("liked");
        likeBtn.querySelector(".like-count").textContent = result.likes;
        likeBtn.childNodes[0].textContent = likeBtn.classList.contains("liked") ? "♥ " : "♡ ";
      } catch (err) { alert(err.message); }
      return;
    }
    const ct = e.target.closest(".btn-comment-toggle");
    if (ct) {
      const section = document.getElementById(`comments-${ct.dataset.postId}`);
      if (section) { const h = section.style.display === "none"; section.style.display = h ? "block" : "none"; if (h) section.querySelector(".comment-input")?.focus(); }
      return;
    }
    const dpb = e.target.closest(".delete-post-btn");
    if (dpb) { if (!confirm("Delete this post?")) return; try { await deletePost(dpb.dataset.postId); dpb.closest(".post-card").remove(); } catch (err) { alert(err.message); } return; }
    const epb = e.target.closest(".edit-post-btn");
    if (epb) {
      const nc = prompt("Edit your post:", epb.dataset.content);
      if (!nc || nc === epb.dataset.content) return;
      try { const u = await updatePost(epb.dataset.postId, nc); epb.closest(".post-card").querySelector(".post-content").textContent = u.content; epb.dataset.content = u.content; } catch (err) { alert(err.message); }
      return;
    }
    const dcb = e.target.closest(".delete-comment-btn");
    if (dcb) {
      const commentEl = dcb.closest(".comment");
      const postCard = dcb.closest(".post-card");
      try {
        await deleteComment(dcb.dataset.commentId);
        commentEl.remove();
        // Update comment count badge
        const badge = postCard.querySelector(`.btn-comment-toggle span`);
        if (badge) badge.textContent = Math.max(0, parseInt(badge.textContent || 0) - 1);
      } catch (err) { alert(err.message); }
    }
  });
  container.addEventListener("submit", async (e) => {
    const cf = e.target.closest(".comment-form");
    if (!cf) return;
    e.preventDefault();
    const input = cf.querySelector(".comment-input");
    const text = input.value.trim();
    if (!text) return;
    try {
      const comment = await addComment(cf.dataset.postId, text);
      document.getElementById(`comments-list-${cf.dataset.postId}`)?.insertAdjacentHTML("beforeend", buildCommentHtml(comment));
      input.value = "";
      const badge = document.querySelector(`.btn-comment-toggle[data-post-id="${cf.dataset.postId}"] span`);
      if (badge) badge.textContent = parseInt(badge.textContent || 0) + 1;
    } catch (err) { alert(err.message); }
  });
}

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
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return `hsl(${Math.abs(hash) % 360}, 55%, 50%)`;
}

loadProfile();
