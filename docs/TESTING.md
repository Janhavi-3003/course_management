# Testing (Task 15)

Automated: `cd backend && MONGO_URI_TEST=mongodb://127.0.0.1:27017/cm_test npm test` — 17 tests (auth, JWT, roles, validation, CRUD, enrol/progress/certificate, notifications, chat, NoSQL-injection, error format).
Without `MONGO_URI_TEST` an in-memory MongoDB is used if `mongodb-memory-server` installed.

Manual checklist: register → login → browse → enrol → read each module and mark it as read → progress → certificate → chat between two browsers → admin login → add/edit/delete course → delete student → wrong password 10× gets rate limited → expired token returns 401 and redirects to login.
Import `docs/postman_collection.json` into Postman for API checks.
