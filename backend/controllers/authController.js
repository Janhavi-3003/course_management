const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { signAccessToken, publicUser } = require("../utils/token");
const { safeNotify } = require("../services/notificationService");

const EXPIRES = () => process.env.JWT_EXPIRES_IN || "1h";

async function register(req, res, next) {
  try {
    const { name, email, password, rollNo } = req.body;
    if (typeof name !== "string" || !name.trim() || typeof email !== "string" ||
        typeof password !== "string" || password.length < 12) {
      return res.status(400).json({
        message: "Valid name, email and password of at least 12 characters are required"
      });
    }
    const normalizedEmail = email.trim().toLowerCase();
    if (await User.exists({ email: normalizedEmail })) {
      return res.status(409).json({ message: "Email already registered" });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "student", // public registration can only create students
      ...(rollNo ? { rollNo } : {})
    });
    await safeNotify(user._id, "Welcome to Course Management! Browse courses and enroll to start learning.");
    return res.status(201).json({
      message: "Registration successful",
      student: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    next(error);
  }
}

async function issueLogin(res, user) {
  return res.json({
    message: "Login successful",
    token: signAccessToken(user),
    tokenType: "Bearer",
    expiresIn: EXPIRES(),
    student: publicUser(user)
  });
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({ message: "Email and password are required" });
    }
    const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+password");
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: "Invalid credentials" });
    return issueLogin(res, user);
  } catch (error) {
    next(error);
  }
}

// Admin sign-in with the Admin ID (e.g. ADM-1042)
async function adminLogin(req, res, next) {
  try {
    const { adminId, password } = req.body;
    if (typeof adminId !== "string" || typeof password !== "string") {
      return res.status(400).json({ message: "Admin ID and password are required" });
    }
    const user = await User.findOne({ adminId: adminId.trim().toUpperCase(), role: "admin" }).select("+password");
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: "Invalid credentials" });
    return issueLogin(res, user);
  } catch (error) {
    next(error);
  }
}

async function me(req, res, next) {
  try {
    const user = await User.findById(req.user.sub);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user: publicUser(user) });
  } catch (error) {
    next(error);
  }
}

// No email service is configured, so (when EXPOSE_RESET_TOKEN=true) the reset token is returned.
async function forgotPassword(req, res, next) {
  try {
    const user = await User.findOne({ email: req.body.email }).select("+password");
    const body = { message: "If an account exists for that email, a password reset link has been generated." };
    if (user) {
      const token = jwt.sign(
        { purpose: "password-reset", pw: user.password.slice(-12) },
        process.env.JWT_SECRET,
        { subject: String(user._id), expiresIn: "15m", algorithm: "HS256" }
      );
      if (process.env.EXPOSE_RESET_TOKEN === "true") body.resetToken = token;
    }
    res.json(body);
  } catch (error) {
    next(error);
  }
}

async function resetPassword(req, res, next) {
  try {
    let decoded;
    try {
      decoded = jwt.verify(req.body.token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
    } catch (e) {
      return res.status(400).json({ message: "Reset link is invalid or has expired" });
    }
    const user = decoded.purpose === "password-reset" ? await User.findById(decoded.sub).select("+password") : null;
    // The token embeds part of the old hash, so it stops working once the password changes.
    if (!user || user.password.slice(-12) !== decoded.pw) {
      return res.status(400).json({ message: "Reset link is invalid or has expired" });
    }
    user.password = await bcrypt.hash(req.body.password, 12);
    await user.save();
    await safeNotify(user._id, "Your password was changed successfully.");
    res.json({ message: "Password reset successful. You can sign in now." });
  } catch (error) {
    next(error);
  }
}

module.exports = { register, login, adminLogin, me, forgotPassword, resetPassword };
