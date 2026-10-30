// Creates the first admin account using the SAME User model + bcrypt hashing as normal registration.
// Usage:  npm run create-admin     (reads ADMIN_* from backend/.env)
const bcrypt = require("bcryptjs");
const User = require("../models/User");

async function ensureAdmin() {
  const isProd = process.env.NODE_ENV === "production";
  const email = (process.env.ADMIN_EMAIL || (isProd ? "" : "admin@coursemanagement.com")).trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || (isProd ? "" : "Admin@Course2026");
  if (!email || !password) {
    console.warn("ADMIN_EMAIL / ADMIN_PASSWORD not set - skipping admin creation");
    return null;
  }
  if (password.length < 12) {
    throw new Error("ADMIN_PASSWORD must contain at least 12 characters");
  }
  const existing = await User.findOne({ email });
  if (existing) return existing;
  const admin = await User.create({
    name: process.env.ADMIN_NAME || "Course Admin",
    email,
    password: await bcrypt.hash(password, 12),
    role: "admin",
    adminId: (process.env.ADMIN_ID || "ADM-1042").toUpperCase()
  });
  console.log(`Admin account created: ${email} (Admin ID ${admin.adminId})`);
  return admin;
}

module.exports = ensureAdmin;

if (require.main === module) {
  require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
  const connectDB = require("../config/db");
  connectDB()
    .then(ensureAdmin)
    .then(() => connectDB.disconnectDB())
    .then(() => process.exit(0))
    .catch((e) => { console.error(e.message); process.exit(1); });
}
