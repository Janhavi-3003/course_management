# Course Management — React Edition (Task 6)

This is the React conversion of the Course Management static site, built with **Vite + React Router**. It reuses the exact same visual design (`src/index.css` is an unmodified copy of the original `css/style.css`) and all the original course data and logic — nothing was redesigned.

## Problem Statement
Students need an easy way to discover, enroll in, and track progress through courses, while admins need a simple way to publish and manage the course catalog. This app solves that with a student-facing catalog + dashboard and an admin-facing course management panel.

## Target Users
- **Students** — browse courses, enroll, complete module content (photo/video/theory), track progress, download certificates.
- **Admins** — add, edit, and delete courses; monitor every student's enrollment and completion progress.

## Features
- Public course catalog with search & filters (category, level)
- Student registration & login, forgot/reset password flow
- Admin login with a separate credential store
- Student dashboard: enrolled courses, completion stats, "continue learning"
- Interactive course player: each module has a photo, video (simulated playback), and theory tab — a module is complete once all three are done
- Auto-generated certificate (with a verification code) once a course reaches 100%
- Notifications feed (enrollment, module completion, course completion)
- Admin dashboard: course count, total enrollments, live per-student progress table
- Add/Edit/Delete course (with auto-generated module content for new courses)
- Fully responsive layout (desktop / tablet / mobile), same breakpoints as the original site

## Tech Stack
- **React 18** + **React Router v6** (routing, `Link`/`NavLink`, protected routes)
- **Vite** (dev server & build)
- Plain CSS (ported 1:1 from the original project, no framework)
- **localStorage** for all data — no backend required (same persistence model as the original)

## Folder Structure
```
course-management-react/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx              # React entry point
    ├── App.jsx                # All routes (React Router)
    ├── index.css              # Original stylesheet, unchanged
    ├── data/
    │   └── courseData.js       # Course catalog + module content (ported from script.js)
    ├── utils/                  # Reusable ES6 modules (Task 5)
    │   ├── storageKeys.js       # localStorage keys + read/write helpers
    │   ├── auth.js              # login/register/session/admin logic
    │   ├── api.js               # courses, enrollments, notifications, progress, certificates
    │   ├── validation.js        # form validation helpers
    │   └── ui.js                # formatting helpers (price, time-ago, certificate ID)
    ├── context/
    │   └── AuthContext.jsx      # centralized logged-in user / admin state
    ├── components/
    │   ├── Navbar.jsx, Footer.jsx, Sidebar.jsx
    │   ├── CourseCard.jsx
    │   ├── FormField.jsx        # reusable field/banner wrapper
    │   └── RouteGuards.jsx      # RequireStudent / RequireAdmin
    └── pages/
        ├── Home.jsx, Role.jsx
        ├── StudentLogin.jsx, StudentRegister.jsx, AdminLogin.jsx
        ├── ForgotPassword.jsx, ResetPassword.jsx
        ├── StudentDashboard.jsx, AdminDashboard.jsx
        ├── BrowseCourses.jsx, CourseDetails.jsx
        ├── AddCourse.jsx, EditCourse.jsx
        ├── MyCourses.jsx, Progress.jsx
        ├── Certificate.jsx, Notifications.jsx
```

## Routes
| Path | Page |
|---|---|
| `/` | Home |
| `/role` | Choose Student / Admin |
| `/student-login`, `/student-register` | Student auth |
| `/admin-login` | Admin auth |
| `/forgot-password`, `/reset-password` | Password recovery |
| `/browse-courses` | Course catalog (public) |
| `/course/:id` | Course details + module player |
| `/student-dashboard`, `/my-courses`, `/progress`, `/notifications`, `/certificate/:courseId` | Student-only (redirects to login otherwise) |
| `/admin-dashboard`, `/add-course`, `/edit-course/:id` | Admin-only (redirects to login otherwise) |

## Setup Instructions
```bash
npm install
npm run dev       # starts the dev server (default: http://localhost:5173)
npm run build     # production build → dist/
npm run preview   # preview the production build
```

A default admin (`jan@admin3003` / see `DEFAULT_ADMIN` in `src/data/courseData.js`) and a default student account are seeded automatically on first run, matching the original app's demo credentials.

## Notes on the conversion
- All 16 original HTML pages were converted into React components with React Router (Task 6).
- The single 1,500-line `script.js` was split into reusable `auth.js`, `api.js`, `validation.js`, and `ui.js` ES6 modules with `import`/`export` (Task 5) — closing the gap the vanilla-JS version had left.
- No CSS was changed — `index.css` is byte-for-byte the original stylesheet, so the design is identical.
