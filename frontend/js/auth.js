// ============================================================
// js/auth.js
//
// Handles the Login and Register pages:
// - Form submissions
// - Validation feedback
// - Saving the JWT on success
// - Redirecting to the feed
// ============================================================

// ─── Shared UI helpers ────────────────────────────────────

/**
 * showError(elementId, message)
 * Display an error message below a form field.
 */
function showError(elementId, message) {
  const el = document.getElementById(elementId);
  if (el) {
    el.textContent = message;
    el.style.display = "block";
  }
}

/**
 * clearErrors()
 * Hide all error messages on the page.
 */
function clearErrors() {
  document.querySelectorAll(".error-msg").forEach((el) => {
    el.textContent = "";
    el.style.display = "none";
  });
}

/**
 * setLoading(btn, loading)
 * Toggle the submit button between active and "loading" states.
 */
function setLoading(btn, loading) {
  btn.disabled = loading;
  btn.textContent = loading ? "Please wait…" : btn.dataset.label;
}

// ─── Redirect if already logged in ────────────────────────
// If the user lands on login/register while already having a
// valid token in localStorage, send them straight to the feed.
if (isLoggedIn()) {
  window.location.href = "index.html";
}

// ══════════════════════════════════════════════════════════
// LOGIN PAGE
// ══════════════════════════════════════════════════════════
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  const submitBtn = loginForm.querySelector("button[type=submit]");
  submitBtn.dataset.label = submitBtn.textContent;

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearErrors();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    // Client-side validation
    if (!email) return showError("loginEmailError", "Email is required");
    if (!password) return showError("loginPasswordError", "Password is required");

    setLoading(submitBtn, true);

    try {
      // Call the API (defined in api.js)
      const data = await login(email, password);

      // Persist the JWT and user object
      saveUserSession(data);

      // Redirect to feed
      window.location.href = "index.html";
    } catch (err) {
      showError("loginGeneralError", err.message);
    } finally {
      setLoading(submitBtn, false);
    }
  });
}

// ══════════════════════════════════════════════════════════
// REGISTER PAGE
// ══════════════════════════════════════════════════════════
const registerForm = document.getElementById("registerForm");
if (registerForm) {
  const submitBtn = registerForm.querySelector("button[type=submit]");
  submitBtn.dataset.label = submitBtn.textContent;

  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearErrors();

    const username = document.getElementById("regUsername").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const password = document.getElementById("regPassword").value;
    const confirm = document.getElementById("regConfirm").value;

    // Validation
    if (!username) return showError("regUsernameError", "Username is required");
    if (username.length < 3)
      return showError("regUsernameError", "Username must be at least 3 characters");
    if (!email) return showError("regEmailError", "Email is required");
    if (!password) return showError("regPasswordError", "Password is required");
    if (password.length < 6)
      return showError("regPasswordError", "Password must be at least 6 characters");
    if (password !== confirm)
      return showError("regConfirmError", "Passwords do not match");

    setLoading(submitBtn, true);

    try {
      const data = await register(username, email, password);
      saveUserSession(data);
      window.location.href = "index.html";
    } catch (err) {
      showError("regGeneralError", err.message);
    } finally {
      setLoading(submitBtn, false);
    }
  });
}
