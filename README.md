# Task Manager — MERN Stack (MongoDB, Express, React, Node)

A full-stack CRUD app with JWT authentication. Users register/login, then create,
read, update, and delete their own tasks. Built as a hands-on prep project for a
Node + React full-stack role.

## Tech Stack

**Backend:** Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs
**Frontend:** React (Vite), React Router, Axios, Context API

## Folder Structure

```
task-manager-app/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── models/
│   │   ├── User.js                # User schema + password hashing
│   │   └── Task.js                # Task schema (linked to a User)
│   ├── middleware/
│   │   └── authMiddleware.js      # Verifies JWT, attaches req.user
│   ├── controllers/
│   │   ├── authController.js      # register/login logic
│   │   └── taskController.js      # CRUD logic for tasks
│   ├── routes/
│   │   ├── authRoutes.js          # /api/auth/*
│   │   └── taskRoutes.js          # /api/tasks/*
│   ├── server.js                  # entry point — wires it all together
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── TaskForm.jsx       # add/edit task form
    │   │   ├── TaskList.jsx       # renders list of TaskItem
    │   │   ├── TaskItem.jsx       # single task row + actions
    │   │   └── PrivateRoute.jsx   # blocks /dashboard if not logged in
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   └── Dashboard.jsx      # owns task state, all CRUD handlers
    │   ├── context/
    │   │   └── AuthContext.jsx    # global auth state (user, login, logout)
    │   ├── services/
    │   │   └── api.js             # shared Axios instance + JWT interceptor
    │   ├── App.jsx                # routes
    │   ├── main.jsx               # mounts App into the DOM
    │   └── index.css
    ├── index.html
    ├── package.json
    └── .env.example
```

## Which File Does What (quick reference)

| File | Responsibility |
|---|---|
| `backend/server.js` | Loads env vars, connects to DB, sets up middleware, mounts routes, starts the server |
| `backend/config/db.js` | Opens the Mongoose/MongoDB connection |
| `backend/models/User.js` | User schema; auto-hashes password on save; has `matchPassword()` helper |
| `backend/models/Task.js` | Task schema; every task has a `user` field (ownership) |
| `backend/middleware/authMiddleware.js` | Reads the JWT from the request header, verifies it, attaches the user to `req.user` |
| `backend/controllers/authController.js` | `registerUser`, `loginUser` — creates users, checks passwords, issues JWTs |
| `backend/controllers/taskController.js` | `getTasks`, `createTask`, `updateTask`, `deleteTask` — all scoped to `req.user._id` |
| `backend/routes/authRoutes.js` | Maps `/api/auth/register` and `/api/auth/login` to controller functions |
| `backend/routes/taskRoutes.js` | Maps `/api/tasks` (GET/POST) and `/api/tasks/:id` (PUT/DELETE); all routes go through `protect` middleware first |
| `frontend/src/services/api.js` | One Axios instance for the app; interceptor auto-attaches the JWT to every request |
| `frontend/src/context/AuthContext.jsx` | Holds `user` state app-wide; exposes `login()`, `register()`, `logout()`; persists to `localStorage` |
| `frontend/src/components/PrivateRoute.jsx` | Redirects to `/login` if no user is logged in |
| `frontend/src/pages/Login.jsx` / `Register.jsx` | Forms that call `AuthContext` methods |
| `frontend/src/pages/Dashboard.jsx` | Fetches tasks on load, owns CRUD handlers, passes them down as props |
| `frontend/src/components/TaskForm.jsx` | Controlled form for creating **and** editing a task |
| `frontend/src/components/TaskList.jsx` / `TaskItem.jsx` | Render the list and individual task rows |
| `frontend/src/App.jsx` | Defines all routes; wraps app in `AuthProvider` |

## The Flow (how a request actually travels)

### 1. Registration / Login flow
1. User fills the `Register` (or `Login`) form → `AuthContext.register()` / `login()` is called.
2. That function calls `POST /api/auth/register` (or `/login`) via the shared `api.js` Axios instance.
3. Request hits `authRoutes.js` → routed to `authController.js`.
4. `registerUser` creates a `User` document. The `pre('save')` hook in `User.js` hashes the password **before** it's stored — controllers never see or store plaintext.
5. Server signs a JWT (`generateToken`) containing the user's `_id` and returns it along with the user's basic info.
6. Frontend saves `{ _id, name, email, token }` to `localStorage` and to `AuthContext` state.
7. User is redirected to `/dashboard`.

### 2. Protected request flow (e.g., fetching tasks)
1. `Dashboard.jsx` mounts → calls `api.get('/tasks')`.
2. **Before** the request leaves the browser, the Axios interceptor in `api.js` reads the token from `localStorage` and adds `Authorization: Bearer <token>` to the headers.
3. Request hits `taskRoutes.js`. Because `router.use(protect)` is declared at the top of that file, **every** route in it passes through `authMiddleware.js` first.
4. `authMiddleware.js` verifies the JWT. If valid, it looks up the user in MongoDB and attaches it as `req.user`. If invalid/missing, it immediately returns `401` — the controller never even runs.
5. Request reaches `taskController.js` → `getTasks` runs `Task.find({ user: req.user._id })`, so it only ever returns tasks belonging to the logged-in user.
6. Response goes back to `Dashboard.jsx`, which stores it in state and passes it to `TaskList` → `TaskItem` for rendering.

### 3. Create / Update / Delete flow
1. User submits `TaskForm` → `Dashboard.handleSubmit()` decides: if `editingTask` is set, call `PUT /api/tasks/:id`; otherwise `POST /api/tasks`.
2. Same JWT flow as above applies (interceptor → `protect` middleware → `req.user`).
3. In `taskController.js`, `updateTask` and `deleteTask` both check `task.user.toString() === req.user._id.toString()` before allowing the change — this is what stops User A from editing User B's tasks even if they somehow guessed the task's ID.
4. Response (updated/deleted task) comes back → `Dashboard.jsx` updates its local `tasks` state → React re-renders `TaskList`.

### Visual summary

```
Browser (React)                    Server (Express)                  Database
────────────────                   ─────────────────                 ─────────
Login/Register form
      │  POST /api/auth/login
      ▼
api.js (Axios) ───────────────►  authRoutes → authController ───►  User collection
      │                                │  (hash/compare password,        (Mongoose)
      │  ◄───── JWT + user info ───────┘   sign JWT)
      ▼
Store JWT in localStorage + AuthContext
      │
      │  GET/POST/PUT/DELETE /api/tasks
      │  (interceptor attaches JWT header)
      ▼
api.js (Axios) ───────────────►  taskRoutes → authMiddleware ────►  verifies JWT
                                        │ (protect)
                                        ▼
                                  taskController ──────────────►  Task collection
                                  (scoped to req.user._id)          (Mongoose)
      ◄───────────── JSON response ─────┘
      ▼
Dashboard updates state → TaskList/TaskItem re-render
```

## Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB running locally, or a free MongoDB Atlas cluster (get a connection string from atlas.mongodb.com)

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# edit .env: set MONGO_URI and a random JWT_SECRET
npm run dev
```

Backend runs on `http://localhost:5000`.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
# edit .env if your backend runs on a different URL
npm run dev
```

Frontend runs on `http://localhost:5173` (Vite default).

### 3. Try it out
1. Open the frontend URL, click Register, create an account.
2. You'll land on the Dashboard — add a task, edit it, mark it done, delete it.
3. Open the Network tab in DevTools and watch the `Authorization: Bearer ...` header go out on every `/api/tasks` call — that's the JWT flow in action.

## API Reference

| Method | Endpoint | Auth required | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Create a new user, returns JWT |
| POST | `/api/auth/login` | No | Login, returns JWT |
| GET | `/api/tasks` | Yes | Get all tasks for the logged-in user |
| POST | `/api/tasks` | Yes | Create a new task |
| PUT | `/api/tasks/:id` | Yes | Update a task (must be owner) |
| DELETE | `/api/tasks/:id` | Yes | Delete a task (must be owner) |

## Things to Try Extending (good for interview talking points)

- Add pagination/filtering to `GET /api/tasks` (by status, priority, due date).
- Add input validation with `Zod` or `express-validator` instead of manual `if` checks.
- Add refresh tokens (currently the JWT just expires after 7 days — no refresh flow).
- Add Socket.io so task updates appear live across multiple open tabs/devices.
- Move from Context API to `Zustand` or `Redux Toolkit` if the team's codebase uses one of those.
- Write a few tests with `Jest` + `Supertest` for the auth and task endpoints.

## Why This Structure (talking points for interviews)

- **MVC-ish separation on the backend**: routes only map URLs → controllers; controllers hold logic; models hold schema/data rules. This is the same layering you'll see in most production Express codebases.
- **Ownership checks in the controller, not just the route**: `protect` only proves *who* you are; `taskController.js` still checks *whether you own this specific resource* before mutating it. This is a common interview question — "how do you stop IDOR (Insecure Direct Object Reference) attacks?"
- **Single Axios instance with an interceptor**: keeps auth logic (attaching the token) in one place instead of repeating it in every API call.
- **State lives in the closest common parent (`Dashboard.jsx`)**: `TaskList` and `TaskItem` are mostly "dumb" components driven by props — a standard React pattern worth being able to explain.
