const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");

// Verifies the Bearer JWT, then re-checks the user in the database so deleted
// users / changed roles are honoured immediately.
async function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication required" });
  }
  let decoded;
  try {
    decoded = jwt.verify(header.slice(7), process.env.JWT_SECRET, {
      algorithms: ["HS256"]
    });
    if (decoded.purpose || !mongoose.isValidObjectId(decoded.sub)) {
      throw new Error("invalid token");
    }
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
  try {
    const user = await User.findById(decoded.sub).select("name email role").lean();
    if (!user) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    req.user = { sub: String(user._id), email: user.email, role: user.role, name: user.name };
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = authMiddleware;
