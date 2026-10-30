# API Reference

Base URL: `http://localhost:5000/api/v1`. Protected routes need `Authorization: Bearer <token>`.
Errors always look like `{ "success": false, "message": "..." }`.

| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | /auth/register | public | Create student account (password ≥ 12 chars) |
| POST | /auth/login | public | Student login → `{token,user}` (rate limited) |
| POST | /auth/admin-login | public | Admin login with Admin ID |
| POST | /auth/forgot-password | public | Generate reset token |
| POST | /auth/reset-password | public | Set new password with token |
| GET | /auth/me | any | Current user |
| GET/POST/PUT/DELETE | /students[/:id] | admin | Student CRUD |
| GET | /courses, /courses/:id | public | Browse |
| POST/PUT/DELETE | /courses[/:id] | admin | Course CRUD |
| GET/PUT | /profile | any | Own profile |
| GET/POST | /enrollments | student | List / enroll `{courseId}` |
| DELETE | /enrollments/:id | student | Withdraw |
| PATCH | /progress/:courseId/module | student | `{moduleId, kind: photo|video|theory}` |
| GET | /certificates, /certificates/course/:courseId | student | Certificates |
| GET | /activity?days=7 | student | Study hours |
| GET | /admin/stats | admin | Totals |
| GET | /messages/contacts, /messages/:userId | any | Chat contacts / history |
| GET/PATCH | /notifications, /:id/read, /read-all | any | Notifications |
| GET | /api/health, /api/health/db | public | Health checks |

**Socket.IO** (same port, `auth: { token }`): emit `send_message {recipientId,text}`; listen `receive_message`, `new_notification`, `online_users`, `data_changed`.
