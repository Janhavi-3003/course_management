const { rateLimit } = require("express-rate-limit");

// Only FAILED attempts count, so normal logins/logouts are never blocked.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.LOGIN_RATE_LIMIT) || 10,
  skipSuccessfulRequests: true,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Too many login attempts. Try again later." }
});

module.exports = loginLimiter;
