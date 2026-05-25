# ✦ Pulse — Mini Social Media Platform

A full-stack social media application built with Node.js, Express, MongoDB, and Vanilla JavaScript. Designed to be beginner-friendly with production-style architecture.

---

## 🗂 Project Structure

```
social-media-app/
├── backend/
│   ├── config/
│   │   └── db.js               # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js   # Register / Login logic
│   │   ├── postController.js   # Post CRUD + Like/Unlike
│   │   ├── commentController.js# Add / Delete comments
│   │   └── userController.js   # Profile, Follow, Unfollow
│   ├── middleware/
│   │   └── authMiddleware.js   # JWT protection middleware
│   ├── models/
│   │   ├── User.js             # User schema (bcrypt hashing)
│   │   ├── Post.js             # Post schema
│   │   └── Comment.js          # Comment schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── postRoutes.js
│   │   ├── commentRoutes.js
│   │   └── userRoutes.js
│   ├── .env                    # Environment variables (DO NOT COMMIT)
│   ├── package.json
│   └── server.js               # App entry point
│
├── frontend/
│   ├── index.html              # Feed page
│   ├── login.html              # Login page
│   ├── register.html           # Register page
│   ├── profile.html            # User profile page
│   ├── css/
│   │   └── style.css           # All styles (responsive + dark mode)
│   ├── js/
│   │   ├── api.js              # All fetch() API calls in one place
│   │   ├── auth.js             # Login / Register form handling
│   │   ├── posts.js            # Feed page logic
│   │   └── profile.js          # Profile page logic
│   └── assets/                 # Images, icons (empty placeholder)
│
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or later
- A free [MongoDB Atlas](https://www.mongodb.com/atlas) account (or local MongoDB)

---

### 1. Clone / Download the project

```bash
git clone <your-repo-url>
cd social-media-app
```

---

### 2. Set up the Backend

```bash
cd backend
npm install
```

Open `backend/.env` and fill in your values:

```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/pulse?retryWrites=true&w=majority
JWT_SECRET=mysupersecretkey_changethis_inproduction
PORT=5000
```

> **Tip:** Generate a strong JWT secret with:  
> `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

Start the backend:

```bash
# Development (auto-restarts on file changes)
npm run dev

# or :
nodemon server.js

# Production
npm start
```

You should see:
```
✅ MongoDB Connected: cluster0.xxxxx.mongodb.net
✅ Server running on http://localhost:5000
```

---

### 3. Run the Frontend

The frontend is plain HTML/CSS/JS — no build step needed.

**Option A — VS Code Live Server (recommended for development)**
1. Install the [Live Server extension](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)
2. Right-click `frontend/index.html` → **Open with Live Server**

**Option B — Any static file server**
```bash
cd frontend
npx serve .
# Visit http://localhost:8000
```

**Option C — Open directly**
Just double-click `frontend/login.html` in your file explorer.  
⚠️ Some browsers block fetch() requests from `file://` URLs — prefer Options A or B.

---

## 🔑 API Reference

### Auth
| Method | Endpoint | Body | Auth | Description |
|--------|----------|------|------|-------------|
| POST | `/api/auth/register` | `{username, email, password}` | ❌ | Create account |
| POST | `/api/auth/login` | `{email, password}` | ❌ | Login, receive JWT |

### Users
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/users/profile/:id` | ✅ | Get profile + posts |
| PUT | `/api/users/follow/:id` | ✅ | Follow a user |
| PUT | `/api/users/unfollow/:id` | ✅ | Unfollow a user |
| GET | `/api/users/search?q=` | ✅ | Search users by username |

### Posts
| Method | Endpoint | Body | Auth | Description |
|--------|----------|------|------|-------------|
| GET | `/api/posts` | — | ✅ | All posts (feed) |
| POST | `/api/posts` | `{content}` | ✅ | Create post |
| GET | `/api/posts/:id` | — | ✅ | Single post |
| PUT | `/api/posts/:id` | `{content}` | ✅ | Edit own post |
| DELETE | `/api/posts/:id` | — | ✅ | Delete own post |
| PUT | `/api/posts/like/:id` | — | ✅ | Like post |
| PUT | `/api/posts/unlike/:id` | — | ✅ | Unlike post |

### Comments
| Method | Endpoint | Body | Auth | Description |
|--------|----------|------|------|-------------|
| POST | `/api/comments/:postId` | `{text}` | ✅ | Add comment |
| DELETE | `/api/comments/:commentId` | — | ✅ | Delete own comment |

> **Auth header format:** `Authorization: Bearer <your_jwt_token>`

---

## 🔐 JWT Authentication Flow

```
1. User submits login form
        ↓
2. POST /api/auth/login  →  Server verifies email + bcrypt hash
        ↓
3. Server returns: { token, _id, username, ... }
        ↓
4. Frontend stores token in localStorage
        ↓
5. All subsequent requests include:
   Header: Authorization: Bearer <token>
        ↓
6. authMiddleware.js verifies token → attaches req.user
        ↓
7. Controller uses req.user._id for ownership checks
```

---

## 🧪 Testing with Postman

1. Import a new collection in Postman
2. Set base URL: `http://localhost:5000`

**Register:**
```
POST /api/auth/register
Body (JSON):
{
  "username": "alice",
  "email": "alice@example.com",
  "password": "password123"
}
```

**Login → copy the token from the response**

**Create a post (add token to Authorization tab → Bearer Token):**
```
POST /api/posts
Body (JSON):
{ "content": "Hello Pulse! My first post 🎉" }
```

**Like the post:**
```
PUT /api/posts/like/<post_id_here>
```

---

## 🗄 MongoDB Schema Relations

```
User  ←──── Post (user field = User._id)
             │
             └──── Comment (post field = Post._id)
                       │
                       └── user field = User._id

User.followers  = [User._id, ...]
User.following  = [User._id, ...]
Post.likes      = [User._id, ...]
Post.comments   = [Comment._id, ...]
```

Mongoose `.populate()` automatically replaces these IDs with the full documents when you query.

---


## ⚠️ Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `MongoServerError: bad auth` | Wrong MONGO_URI password | Double-check Atlas DB user password |
| `Cannot GET /api/posts` | Server not running | Run `npm run dev` in `/backend` |
| `401 Not authorized` | Missing/expired token | Log in again; check localStorage |
| `CORS error` in browser | Backend URL mismatch | Check `BASE_URL` in `api.js` matches your backend |
| `404 on like route` | Route ordering bug | Ensure `/like/:id` is declared before `/:id` in postRoutes.js |
| `bcrypt` install error on Windows | Node version mismatch | Use Node v18+ or run `npm rebuild bcryptjs` |

---

## 🎨 Features

- ✅ JWT Authentication (register, login, logout)
- ✅ Create / Edit / Delete posts
- ✅ Like / Unlike posts
- ✅ Comments (add & delete)
- ✅ User profiles with follower/following counts
- ✅ Follow / Unfollow users
- ✅ Live user search with debounce
- ✅ Responsive layout (mobile + desktop)
- ✅ Dark mode (auto via `prefers-color-scheme`)
- ✅ Character counter on post form
- ✅ Relative timestamps ("2h ago")
- ✅ XSS protection (HTML escaping)
- ✅ Color-coded avatars (deterministic per username)

---

## 📄 License

MIT — free for personal and commercial use.
