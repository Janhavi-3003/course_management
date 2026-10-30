const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const mongoose = require("mongoose");
const { rateLimit } = require("express-rate-limit");

const { allowedOrigins } = require("./config/origins");
const mongoSanitize = require("./middleware/mongoSanitize");
const errorHandler = require("./middleware/errorHandler");

const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const courseRoutes = require("./routes/courseRoutes");
const profileRoutes = require("./routes/profileRoutes");
const enrollmentRoutes = require("./routes/enrollmentRoutes");
const learningProgressRoutes = require("./routes/learningProgressRoutes");
const certificateRoutes = require("./routes/certificateRoutes");
const activityRoutes = require("./routes/activityRoutes");
const messageRoutes = require("./routes/messageRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();
app.set("trust proxy", 1); // behind Render's proxy
app.disable("x-powered-by");

// 1. security headers, CORS, parsing
app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      const allowed = allowedOrigins();
      if (!origin || allowed.includes(origin)) return callback(null, true);
      callback(Object.assign(new Error("Origin not allowed by CORS"), { status: 403 }));
    }
  })
);
app.use(compression());
if (process.env.NODE_ENV !== "test") app.use(morgan("combined"));
app.use(express.json({ limit: "100kb" }));
app.use(mongoSanitize);
app.use(
  "/api",
  rateLimit({ windowMs: 15 * 60 * 1000, limit: 2000, standardHeaders: "draft-8", legacyHeaders: false, message: { message: "Too many requests. Please slow down." } })
);

// 2. health + status
app.get("/", (req, res) => {
  res.json({ name: "Course Management API", status: "running", docs: "/api/health" });
});
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "API is running" });
});
app.get("/api/health/db", (req, res) => {
  const up = mongoose.connection.readyState === 1;
  res.status(up ? 200 : 503).json({ status: up ? "ok" : "error", database: up ? "connected" : "disconnected" });
});

// 3. API routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/students", studentRoutes);
app.use("/api/v1/courses", courseRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/enrollments", enrollmentRoutes);
app.use("/api/v1/progress", learningProgressRoutes);
app.use("/api/v1/certificates", certificateRoutes);
app.use("/api/v1/activity", activityRoutes);
app.use("/api/v1/messages", messageRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/admin", adminRoutes);

// 4. unknown routes, then the centralized error handler (must be last)
app.use((req, res) => {
  res.status(404).json({ message: "API endpoint not found" });
});
app.use(errorHandler);

module.exports = app;
