const User = require("../models/User");
const ser = require("../utils/serialize");

async function getProfile(req, res, next) {
  try {
    const user = await User.findById(req.user.sub).select("name email role rollNo adminId createdAt").lean();
    if (!user) return res.status(404).json({ message: "Profile not found" });
    res.json({ user: ser(user) });
  } catch (error) {
    next(error);
  }
}

async function updateProfile(req, res, next) {
  try {
    const { name, rollNo } = req.body;
    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ message: "Valid name is required" });
    }
    const updates = { name: name.trim() };
    if (rollNo !== undefined) updates.rollNo = rollNo;
    const user = await User.findByIdAndUpdate(
      req.user.sub,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("name email role rollNo");
    if (!user) return res.status(404).json({ message: "Profile not found" });
    res.json({ message: "Profile updated", user: ser(user) });
  } catch (error) {
    next(error);
  }
}

module.exports = { getProfile, updateProfile };
