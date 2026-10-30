# Course Management (StudySync)

Full-stack course platform: **React + Vite** frontend, **Express + MongoDB** backend, **JWT** auth, **Socket.IO** chat and live notifications.

## Quick start
```
npm run install:all
npm run dev          # backend :5000 + frontend :5173
```
With empty `MONGO_URI` in `backend/.env` a built-in local MongoDB starts automatically. For real MongoDB set `MONGO_URI` (local or Atlas).
Mock mode (Task 7, json-server, no backend): `npm run dev:mock`.

## Demo logins (SEED_DEMO=true)
| Role | Login | Password |
|---|---|---|
| Admin | ADM-1042 (or admin@coursemanagement.com) | Admin@Course2026 |
| Student | asha@school.edu | asha-learn-2026 |
| Student | ravi@school.edu | ravi-learn-2026 |

## Where each task lives
| Task | Location |
|---|---|
| 1 GitHub & docs | this README, `docs/` |
| 2–5 HTML / CSS / validation / JS | original static folders + `react-frontend/src/index.css`, `utils/validation.js` |
| 6 React | `react-frontend/` |
| 7 Mock API | `mockapi/`, `react-frontend/src/services/mockApi.js` |
| 8 Express backend | `backend/app.js`, `server.js` |
| 9 Student & course APIs | `backend/routes`, `controllers` |
| 10 JWT | `backend/middleware/authMiddleware.js`, `utils/token.js` |
| 11 DB schema | `backend/models`, `docs/database-schema.md` |
| 12 DB CRUD | `backend/controllers` |
| 13 Socket.IO | `backend/config/socket.js`, `react-frontend/src/pages/Chat.jsx` |
| 14 Security & errors | `backend/middleware` (helmet, CORS, rate limit, sanitizer, errorHandler) |
| 15 Deploy & test | `docs/DEPLOYMENT.md`, `docs/TESTING.md`, `render.yaml`, `.github/workflows/ci.yml` |

See `docs/API.md` for the endpoint list.
