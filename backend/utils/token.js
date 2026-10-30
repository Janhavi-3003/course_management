const jwt = require("jsonwebtoken");

function signAccessToken(user) {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is missing");
  return jwt.sign(
    { email: user.email, role: user.role },
    process.env.JWT_SECRET,
    {
      subject: String(user._id),
      expiresIn: process.env.JWT_EXPIRES_IN || "1h",
      algorithm: "HS256"
    }
  );
}

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    rollNo: user.rollNo,
    adminId: user.adminId
  };
}

module.exports = { signAccessToken, publicUser };
