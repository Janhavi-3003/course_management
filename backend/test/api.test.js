// Integration tests: real Express app + real MongoDB + real Socket.IO.
// Run:  MONGO_URI_TEST=mongodb://127.0.0.1:27017/cm_test npm test
// (without MONGO_URI_TEST an in-memory MongoDB is started if mongodb-memory-server is installed)
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret-test-secret-test-secret";
process.env.JWT_EXPIRES_IN = "1h";
process.env.CLIENT_URL = "http://localhost:5173";
process.env.LOGIN_RATE_LIMIT = "1000";
process.env.EXPOSE_RESET_TOKEN = "true";
process.env.ADMIN_EMAIL = "admin@test.com";
process.env.ADMIN_PASSWORD = "Admin@Test12345";
process.env.ADMIN_ID = "ADM-TEST";
process.env.SEED_DEMO = "false";

const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const http = require("http");
const mongoose = require("mongoose");
const { io: ioClient } = require("socket.io-client");

const app = require("../app");
const connectDB = require("../config/db");
const initializeSocket = require("../config/socket");
const { seedOnStartup } = require("../scripts/seed");
const User = require("../models/User");

let server, base, memory;
const tokens = {};
const ids = {};

async function api(method, path, { token, body, headers } = {}) {
  const res = await fetch(base + path, {
    method,
    headers: {
      ...(body ? { "content-type": "application/json" } : {}),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...headers
    },
    body: body ? JSON.stringify(body) : undefined
  });
  let json = null;
  try { json = await res.json(); } catch (e) { /* no body */ }
  return { status: res.status, body: json };
}

before(async () => {
  let uri = process.env.MONGO_URI_TEST;
  if (!uri) {
    const { MongoMemoryServer } = require("mongodb-memory-server");
    memory = await MongoMemoryServer.create();
    uri = memory.getUri("cm_test");
  }
  await connectDB(uri);
  await mongoose.connection.db.dropDatabase();
  await Promise.all(Object.values(mongoose.models).map((m) => m.init()));
  await seedOnStartup();
  server = http.createServer(app);
  initializeSocket(server);
  await new Promise((r) => server.listen(0, r));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((r) => server.close(r));
  await mongoose.connection.db.dropDatabase();
  await connectDB.disconnectDB();
  if (memory) await memory.stop();
});

// ---------- Task 8: server + health ----------
test("GET / and /api/health respond", async () => {
  assert.equal((await api("GET", "/")).status, 200);
  const h = await api("GET", "/api/health");
  assert.deepEqual(h.body, { status: "ok", message: "API is running" });
  assert.equal((await api("GET", "/api/health/db")).status, 200);
});

// ---------- Task 9/10: registration + login + JWT ----------
test("register validates input", async () => {
  const bad = await api("POST", "/api/v1/auth/register", { body: { name: "A", email: "nope", password: "short" } });
  assert.equal(bad.status, 400);
  assert.ok(bad.body.errors.length >= 2);
  const missing = await api("POST", "/api/v1/auth/register", { body: {} });
  assert.equal(missing.status, 400);
});

test("register creates a student with a hashed password; duplicates are rejected", async () => {
  const ok = await api("POST", "/api/v1/auth/register", {
    body: { name: "Student One", email: "One@Test.com", password: "student-one-pass", rollNo: "R1" }
  });
  assert.equal(ok.status, 201);
  assert.equal(ok.body.student.role, "student");
  assert.equal(ok.body.student.email, "one@test.com");
  ids.s1 = ok.body.student.id;
  const stored = await User.findById(ids.s1).select("+password");
  assert.ok(stored.password.startsWith("$2"), "password must be a bcrypt hash");
  assert.notEqual(stored.password, "student-one-pass");
  const dup = await api("POST", "/api/v1/auth/register", {
    body: { name: "Student One", email: "one@test.com", password: "student-one-pass" }
  });
  assert.equal(dup.status, 409);
  const reg2 = await api("POST", "/api/v1/auth/register", {
    body: { name: "Student Two", email: "two@test.com", password: "student-two-pass" }
  });
  ids.s2 = reg2.body.student.id;
});

test("a user cannot register as admin", async () => {
  const r = await api("POST", "/api/v1/auth/register", {
    body: { name: "Sneaky", email: "sneaky@test.com", password: "sneaky-password-1", role: "admin" }
  });
  assert.equal(r.status, 201);
  assert.equal(r.body.student.role, "student");
});

test("login: wrong credentials 401, success returns JWT", async () => {
  assert.equal((await api("POST", "/api/v1/auth/login", { body: { email: "one@test.com", password: "wrong-wrong-wrong" } })).status, 401);
  assert.equal((await api("POST", "/api/v1/auth/login", { body: { email: "ghost@test.com", password: "whatever-whatever" } })).status, 401);
  const s1 = await api("POST", "/api/v1/auth/login", { body: { email: "one@test.com", password: "student-one-pass" } });
  assert.equal(s1.status, 200);
  assert.equal(s1.body.tokenType, "Bearer");
  tokens.s1 = s1.body.token;
  const s2 = await api("POST", "/api/v1/auth/login", { body: { email: "two@test.com", password: "student-two-pass" } });
  tokens.s2 = s2.body.token;
  const admin = await api("POST", "/api/v1/auth/admin-login", { body: { adminId: "adm-test", password: "Admin@Test12345" } });
  assert.equal(admin.status, 200);
  assert.equal(admin.body.student.role, "admin");
  tokens.admin = admin.body.token;
  // a student cannot use the admin-login endpoint
  assert.equal((await api("POST", "/api/v1/auth/admin-login", { body: { adminId: "STU-001", password: "student-one-pass" } })).status, 401);
});

test("protected routes: no token / bad token -> 401; student on admin route -> 403", async () => {
  assert.equal((await api("GET", "/api/v1/profile")).status, 401);
  assert.equal((await api("GET", "/api/v1/profile", { token: "garbage" })).status, 401);
  assert.equal((await api("GET", "/api/v1/students", { token: tokens.s1 })).status, 403);
  assert.equal((await api("GET", "/api/v1/students")).status, 401);
  const jwt = require("jsonwebtoken");
  const expired = jwt.sign({ role: "admin" }, process.env.JWT_SECRET, { subject: ids.s1, expiresIn: -10 });
  assert.equal((await api("GET", "/api/v1/profile", { token: expired })).status, 401);
  const wrongKey = jwt.sign({ role: "admin" }, "other-secret", { subject: ids.s1 });
  assert.equal((await api("GET", "/api/v1/students", { token: wrongKey })).status, 401);
  // role inside a forged-but-valid token is NOT trusted: DB role is used
  const forged = jwt.sign({ role: "admin" }, process.env.JWT_SECRET, { subject: ids.s1, expiresIn: "1h" });
  assert.equal((await api("GET", "/api/v1/students", { token: forged })).status, 403);
});

// ---------- Task 12: profile ----------
test("profile get/update persists", async () => {
  const g = await api("GET", "/api/v1/profile", { token: tokens.s1 });
  assert.equal(g.status, 200);
  assert.equal(g.body.user.name, "Student One");
  const u = await api("PUT", "/api/v1/profile", { token: tokens.s1, body: { name: "Student Uno" } });
  assert.equal(u.status, 200);
  assert.equal((await api("GET", "/api/v1/profile", { token: tokens.s1 })).body.user.name, "Student Uno");
  assert.equal((await api("PUT", "/api/v1/profile", { token: tokens.s1, body: { name: " " } })).status, 400);
});

// ---------- Task 9: student CRUD (admin) ----------
test("student CRUD (admin only) with validation and error codes", async () => {
  const list = await api("GET", "/api/v1/students", { token: tokens.admin });
  assert.equal(list.status, 200);
  assert.ok(list.body.students.length >= 2);
  assert.ok(!JSON.stringify(list.body).includes("$2"), "no password hashes in responses");

  assert.equal((await api("GET", "/api/v1/students/not-an-id", { token: tokens.admin })).status, 400);
  assert.equal((await api("GET", "/api/v1/students/64b7f0f0f0f0f0f0f0f0f0f0", { token: tokens.admin })).status, 404);

  const c = await api("POST", "/api/v1/students", { token: tokens.admin, body: { name: "Made By Admin", email: "made@test.com", password: "made-by-admin-1" } });
  assert.equal(c.status, 201);
  const id = c.body.student.id;
  assert.equal((await api("POST", "/api/v1/students", { token: tokens.admin, body: { name: "Dup", email: "made@test.com", password: "made-by-admin-1" } })).status, 409);
  assert.equal((await api("POST", "/api/v1/students", { token: tokens.admin, body: { name: "X" } })).status, 400);

  const u = await api("PUT", `/api/v1/students/${id}`, { token: tokens.admin, body: { name: "Renamed" } });
  assert.equal(u.status, 200);
  assert.equal(u.body.student.name, "Renamed");
  assert.equal((await api("PUT", `/api/v1/students/${id}`, { token: tokens.admin, body: {} })).status, 400);
  assert.equal((await api("PUT", `/api/v1/students/${id}`, { token: tokens.admin, body: { email: "one@test.com" } })).status, 409);
  // a student cannot update someone else
  assert.equal((await api("PUT", `/api/v1/students/${id}`, { token: tokens.s1, body: { name: "Hacked" } })).status, 403);

  assert.equal((await api("DELETE", `/api/v1/students/${id}`, { token: tokens.admin })).status, 200);
  assert.equal((await api("GET", `/api/v1/students/${id}`, { token: tokens.admin })).status, 404);
  assert.equal((await api("DELETE", `/api/v1/students/${id}`, { token: tokens.admin })).status, 404);
});

// ---------- Task 9/12: course CRUD ----------
test("courses: public read, admin-only write, validation", async () => {
  const list = await api("GET", "/api/v1/courses");
  assert.equal(list.status, 200);
  assert.equal(list.body.courses.length, 9);
  assert.equal(list.body.pagination.total, 9);
  const search = await api("GET", "/api/v1/courses?q=react&category=Web%20Development");
  assert.ok(search.body.courses.length >= 1);
  assert.equal((await api("GET", "/api/v1/courses?level=Nope")).status, 400);
  ids.course = list.body.courses[1].id;
  assert.equal((await api("GET", `/api/v1/courses/${ids.course}`)).status, 200);
  assert.equal((await api("GET", "/api/v1/courses/bad-id")).status, 400);
  assert.equal((await api("GET", "/api/v1/courses/64b7f0f0f0f0f0f0f0f0f0f0")).status, 404);

  const payload = { title: "Test Course", description: "A course created by the test-suite.", duration: 5, category: "Cloud", level: "Beginner", instructor: "Tester", price: 100, lessons: 10 };
  assert.equal((await api("POST", "/api/v1/courses", { body: payload })).status, 401);
  assert.equal((await api("POST", "/api/v1/courses", { token: tokens.s1, body: payload })).status, 403);
  assert.equal((await api("POST", "/api/v1/courses", { token: tokens.admin, body: { title: "x" } })).status, 400);
  assert.equal((await api("POST", "/api/v1/courses", { token: tokens.admin, body: { ...payload, duration: 0 } })).status, 400);

  const c = await api("POST", "/api/v1/courses", { token: tokens.admin, body: payload });
  assert.equal(c.status, 201);
  assert.equal(c.body.course.modules.length, 3, "modules auto-generated");
  assert.equal(c.body.course.lessons, 10);
  const cid = c.body.course.id;

  // admin-written text modules are stored as given; bad module content is rejected
  const own = await api("POST", "/api/v1/courses", { token: tokens.admin, body: { ...payload, title: "Own Text Course", modules: [
    { moduleId: "a1", title: "Intro", lessons: 2, theory: ["First paragraph.", "Second paragraph."] },
    { moduleId: "a2", title: "Next", lessons: 3, theory: ["More text."] }
  ] } });
  assert.equal(own.status, 201);
  assert.equal(own.body.course.lessons, 5);
  assert.deepEqual(own.body.course.modules[0].theory, ["First paragraph.", "Second paragraph."]);
  assert.equal((await api("POST", "/api/v1/courses", { token: tokens.admin, body: { ...payload, modules: [{ moduleId: "x", title: "", theory: [] }] } })).status, 400);
  assert.equal((await api("DELETE", `/api/v1/courses/${own.body.course.id}`, { token: tokens.admin })).status, 200);

  const u = await api("PUT", `/api/v1/courses/${cid}`, { token: tokens.admin, body: { title: "Test Course v2", price: 0 } });
  assert.equal(u.status, 200);
  assert.equal(u.body.course.title, "Test Course v2");
  assert.equal((await api("PUT", `/api/v1/courses/${cid}`, { token: tokens.admin, body: { duration: -4 } })).status, 400);
  assert.equal((await api("PUT", "/api/v1/courses/64b7f0f0f0f0f0f0f0f0f0f0", { token: tokens.admin, body: { title: "Nope nope" } })).status, 404);

  assert.equal((await api("DELETE", `/api/v1/courses/${cid}`, { token: tokens.s1 })).status, 403);
  assert.equal((await api("DELETE", `/api/v1/courses/${cid}`, { token: tokens.admin })).status, 200);
  assert.equal((await api("GET", `/api/v1/courses/${cid}`)).status, 404);

  // students were notified about the new course
  const notes = await api("GET", "/api/v1/notifications", { token: tokens.s1 });
  assert.ok(notes.body.notifications.some((n) => n.message.includes("New course available: Test Course")));
});

// ---------- Enrollment, progress, certificate ----------
test("enrollment -> module progress -> completion -> certificate; withdraw & re-enroll", async () => {
  const course = (await api("GET", `/api/v1/courses/${ids.course}`)).body.course;
  assert.equal((await api("POST", "/api/v1/enrollments", { token: tokens.admin, body: { courseId: ids.course } })).status, 403);
  assert.equal((await api("POST", "/api/v1/enrollments", { token: tokens.s1, body: { courseId: "bad" } })).status, 400);
  assert.equal((await api("POST", "/api/v1/enrollments", { token: tokens.s1, body: { courseId: "64b7f0f0f0f0f0f0f0f0f0f0" } })).status, 404);
  const e = await api("POST", "/api/v1/enrollments", { token: tokens.s1, body: { courseId: ids.course } });
  assert.equal(e.status, 201);
  assert.equal(e.body.enrollment.progress, 0);
  const enrollmentId = e.body.enrollment.id;
  assert.equal((await api("POST", "/api/v1/enrollments", { token: tokens.s1, body: { courseId: ids.course } })).status, 409);

  // cannot record progress without enrolling (student 2)
  const m1 = course.modules[0].moduleId;
  assert.equal((await api("PATCH", `/api/v1/progress/${ids.course}/module`, { token: tokens.s2, body: { moduleId: m1, kind: "photo" } })).status, 403);
  assert.equal((await api("PATCH", `/api/v1/progress/${ids.course}/module`, { token: tokens.s1, body: { moduleId: "zzz", kind: "photo" } })).status, 400);
  assert.equal((await api("PATCH", `/api/v1/progress/${ids.course}/module`, { token: tokens.s1, body: { moduleId: m1, kind: "bad" } })).status, 400);

  let last;
  for (const [i, mod] of course.modules.entries()) {
    last = await api("PATCH", `/api/v1/progress/${ids.course}/module`, { token: tokens.s1, body: { moduleId: mod.moduleId, kind: "theory" } });
    assert.equal(last.status, 200);
    assert.equal(last.body.moduleDone, true);
    if (i === 0) assert.ok(last.body.enrollment.progress > 0 && last.body.enrollment.progress < 100);
  }
  assert.equal(last.body.courseDone, true);
  assert.equal(last.body.enrollment.progress, 100);
  assert.equal(last.body.enrollment.status, "Completed");
  assert.ok(last.body.certificate.code.startsWith("CM-"));
  // repeating is a no-op
  const again = await api("PATCH", `/api/v1/progress/${ids.course}/module`, { token: tokens.s1, body: { moduleId: m1, kind: "theory" } });
  assert.equal(again.body.moduleDone, false);

  const list = await api("GET", "/api/v1/enrollments", { token: tokens.s1 });
  assert.equal(list.body.enrollments.length, 1);
  assert.equal(list.body.enrollments[0].enrollmentStatus, "completed");
  const cert = await api("GET", `/api/v1/certificates/course/${ids.course}`, { token: tokens.s1 });
  assert.equal(cert.status, 200);
  assert.equal(cert.body.certificate.student.name, "Student Uno");
  assert.equal((await api("GET", `/api/v1/certificates/course/${ids.course}`, { token: tokens.s2 })).status, 404);
  assert.equal((await api("GET", "/api/v1/certificates", { token: tokens.s1 })).body.certificates.length, 1);

  const act = await api("GET", "/api/v1/activity?days=7", { token: tokens.s1 });
  assert.ok(act.body.activity[0].hours >= 1);

  // admin sees all enrollments with student + course
  const all = await api("GET", "/api/v1/enrollments", { token: tokens.admin });
  assert.ok(all.body.enrollments.some((x) => x.student && x.student.name === "Student Uno" && x.course.title));
  const stats = await api("GET", "/api/v1/admin/stats", { token: tokens.admin });
  assert.equal(stats.body.stats.courses, 9);
  assert.equal((await api("GET", "/api/v1/admin/stats", { token: tokens.s1 })).status, 403);

  // withdraw keeps history; re-enrolling reactivates (no unique-index error, progress kept)
  assert.equal((await api("DELETE", `/api/v1/enrollments/${enrollmentId}`, { token: tokens.s2 })).status, 404);
  assert.equal((await api("DELETE", `/api/v1/enrollments/${enrollmentId}`, { token: tokens.s1 })).status, 200);
  assert.equal((await api("GET", "/api/v1/enrollments", { token: tokens.s1 })).body.enrollments.length, 0);
  const re = await api("POST", "/api/v1/enrollments", { token: tokens.s1, body: { courseId: ids.course } });
  assert.equal(re.status, 201);
  assert.equal(re.body.enrollment.progress, 100);
});

// ---------- Notifications ----------
test("notifications: list, mark read, ownership enforced", async () => {
  const n = await api("GET", "/api/v1/notifications", { token: tokens.s1 });
  assert.equal(n.status, 200);
  assert.ok(n.body.notifications.length >= 3);
  const first = n.body.notifications.find((x) => !x.isRead);
  assert.equal((await api("PATCH", `/api/v1/notifications/${first.id}/read`, { token: tokens.s2 })).status, 404);
  const r = await api("PATCH", `/api/v1/notifications/${first.id}/read`, { token: tokens.s1 });
  assert.equal(r.body.notification.isRead, true);
  assert.equal((await api("PATCH", "/api/v1/notifications/bad/read", { token: tokens.s1 })).status, 400);
  const all = await api("PATCH", "/api/v1/notifications/read-all", { token: tokens.s1 });
  assert.equal(all.status, 200);
  const after = await api("GET", "/api/v1/notifications", { token: tokens.s1 });
  assert.ok(after.body.notifications.every((x) => x.isRead));
});

// ---------- Password reset ----------
test("forgot + reset password flow", async () => {
  const f = await api("POST", "/api/v1/auth/forgot-password", { body: { email: "two@test.com" } });
  assert.equal(f.status, 200);
  assert.ok(f.body.resetToken);
  const unknown = await api("POST", "/api/v1/auth/forgot-password", { body: { email: "nobody@test.com" } });
  assert.equal(unknown.status, 200);
  assert.equal(unknown.body.resetToken, undefined);
  assert.equal((await api("POST", "/api/v1/auth/reset-password", { body: { token: f.body.resetToken, password: "short" } })).status, 400);
  const r = await api("POST", "/api/v1/auth/reset-password", { body: { token: f.body.resetToken, password: "brand-new-pass-2" } });
  assert.equal(r.status, 200);
  // the same token cannot be reused
  assert.equal((await api("POST", "/api/v1/auth/reset-password", { body: { token: f.body.resetToken, password: "another-pass-123" } })).status, 400);
  assert.equal((await api("POST", "/api/v1/auth/login", { body: { email: "two@test.com", password: "student-two-pass" } })).status, 401);
  const l = await api("POST", "/api/v1/auth/login", { body: { email: "two@test.com", password: "brand-new-pass-2" } });
  assert.equal(l.status, 200);
  tokens.s2 = l.body.token;
  // reset tokens cannot be used as access tokens
  assert.equal((await api("GET", "/api/v1/profile", { token: f.body.resetToken })).status, 401);
});

// ---------- Task 13: real-time chat + notifications ----------
function connect(token) {
  return new Promise((resolve, reject) => {
    const s = ioClient(base, { auth: { token }, transports: ["websocket"], reconnection: false });
    s.on("connect", () => resolve(s));
    s.on("connect_error", (e) => { s.close(); reject(e); });
  });
}
const once = (socket, event) => new Promise((r) => socket.once(event, r));
const emitAck = (socket, event, data) => new Promise((r) => socket.emit(event, data, r));

test("sockets: unauthenticated / invalid tokens are rejected", async () => {
  await assert.rejects(connect(undefined), /Authentication required/);
  await assert.rejects(connect("garbage"), /Invalid authentication token/);
});

test("sockets: message goes to recipient instantly, is stored, notifies, and history is private", async () => {
  const a = await connect(tokens.s1);
  const b = await connect(tokens.s2);
  try {
    const gotMessage = once(b, "receive_message");
    const gotNote = once(b, "new_notification");
    const ack = await emitAck(a, "send_message", { recipientId: ids.s2, text: "Hello <b>Student Two</b>!" });
    assert.equal(ack.success, true);
    const msg = await gotMessage;
    assert.equal(msg.sender, ids.s1);
    assert.equal(msg.recipient, ids.s2);
    assert.equal(msg.text, "Hello Student Two!", "HTML stripped");
    const note = await gotNote;
    assert.match(note.message, /New message from Student Uno/);

    // validation / authorization
    assert.equal((await emitAck(a, "send_message", { recipientId: "bad", text: "x" })).success, false);
    assert.equal((await emitAck(a, "send_message", { recipientId: ids.s1, text: "to myself" })).success, false);
    assert.equal((await emitAck(a, "send_message", { recipientId: ids.s2, text: "   " })).success, false);
    assert.equal((await emitAck(a, "send_message", { recipientId: "64b7f0f0f0f0f0f0f0f0f0f0", text: "ghost" })).success, false);

    // presence
    const online = await new Promise((r) => a.emit("get_online_users", r));
    assert.ok(online.includes(ids.s1) && online.includes(ids.s2));

    // history API persists, only participants can see it
    const hist = await api("GET", `/api/v1/messages/${ids.s2}`, { token: tokens.s1 });
    assert.equal(hist.body.messages.length, 1);
    assert.equal((await api("GET", `/api/v1/messages/${ids.s1}`, { token: tokens.s2 })).body.messages.length, 1);
    assert.equal((await api("GET", `/api/v1/messages/${ids.s2}`, { token: tokens.admin })).body.messages.length, 0, "third party sees nothing");
    assert.equal((await api("GET", "/api/v1/messages/bad", { token: tokens.s1 })).status, 400);
    assert.equal((await api("GET", `/api/v1/messages/${ids.s2}`)).status, 401);
    const contacts = await api("GET", "/api/v1/messages/contacts", { token: tokens.s1 });
    assert.ok(contacts.body.contacts.some((c) => c.id === ids.s2));
    assert.ok(!contacts.body.contacts.some((c) => c.id === ids.s1));
  } finally {
    a.close(); b.close();
  }
});

test("sockets: rate limit (10 messages / 10s)", async () => {
  const a = await connect(tokens.s1);
  try {
    const results = [];
    for (let i = 0; i < 12; i++) results.push(await emitAck(a, "send_message", { recipientId: ids.s2, text: `spam ${i}` }));
    assert.ok(results.some((r) => r.success === false && /too fast/.test(r.message)));
  } finally { a.close(); }
});

// ---------- Task 14: security ----------
test("security: CORS, malformed JSON, NoSQL injection, XSS, unknown routes, headers", async () => {
  const blocked = await api("GET", "/api/v1/courses", { headers: { origin: "https://evil.example" } });
  assert.equal(blocked.status, 403);
  const allowed = await fetch(base + "/api/v1/courses", { headers: { origin: "http://localhost:5173" } });
  assert.equal(allowed.status, 200);
  assert.equal(allowed.headers.get("access-control-allow-origin"), "http://localhost:5173");
  assert.ok(allowed.headers.get("x-content-type-options"), "helmet headers present");
  assert.equal(allowed.headers.get("x-powered-by"), null);

  const malformed = await fetch(base + "/api/v1/auth/login", { method: "POST", headers: { "content-type": "application/json" }, body: "{bad json" });
  assert.equal(malformed.status, 400);

  const inj = await api("POST", "/api/v1/auth/login", { body: { email: { $gt: "" }, password: { $gt: "" } } });
  assert.equal(inj.status, 400);
  const inj2 = await api("POST", "/api/v1/auth/login", { body: { email: "one@test.com", password: { $ne: "x" } } });
  assert.ok([400, 401].includes(inj2.status));

  const xss = await api("POST", "/api/v1/auth/register", { body: { name: "<script>alert(1)</script>Eve", email: "eve@test.com", password: "eve-password-123" } });
  assert.equal(xss.status, 201);
  assert.equal((await User.findOne({ email: "eve@test.com" })).name, "alert(1)Eve");

  const nf = await api("GET", "/api/v1/does-not-exist");
  assert.equal(nf.status, 404);
  assert.deepEqual(nf.body, { message: "API endpoint not found" });

  const big = await fetch(base + "/api/v1/auth/register", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: "x".repeat(200000) }) });
  assert.equal(big.status, 413);
});

test("deleting a student removes dependent records", async () => {
  const Enrollment = require("../models/Enrollment");
  const Notification = require("../models/Notification");
  const Message = require("../models/Message");
  assert.ok((await Enrollment.countDocuments({ student: ids.s1 })) > 0);
  assert.equal((await api("DELETE", `/api/v1/students/${ids.s1}`, { token: tokens.admin })).status, 200);
  assert.equal(await Enrollment.countDocuments({ student: ids.s1 }), 0);
  assert.equal(await Notification.countDocuments({ recipient: ids.s1 }), 0);
  assert.equal(await Message.countDocuments({ $or: [{ sender: ids.s1 }, { recipient: ids.s1 }] }), 0);
  // the deleted user's old token no longer works
  assert.equal((await api("GET", "/api/v1/profile", { token: tokens.s1 })).status, 401);
});
