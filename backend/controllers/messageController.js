const mongoose = require("mongoose");
const Message = require("../models/Message");
const User = require("../models/User");
const ser = require("../utils/serialize");
const { getIO } = require("../config/socket");

// Everyone you can chat with (all users except yourself)
async function getContacts(req, res, next) {
  try {
    const users = await User.find({ _id: { $ne: req.user.sub } }).select("name role").sort({ name: 1 }).limit(300).lean();
    res.json({ contacts: ser(users) });
  } catch (error) {
    next(error);
  }
}

// Only returns the conversation between the token owner and :userId
async function getHistory(req, res, next) {
  try {
    const myId = req.user.sub;
    const otherId = req.params.userId;
    if (!mongoose.isValidObjectId(myId) || !mongoose.isValidObjectId(otherId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    const messages = await Message.find({
      $or: [
        { sender: myId, recipient: otherId },
        { sender: otherId, recipient: myId }
      ]
    })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    res.json({ messages: ser(messages.reverse()) });
  } catch (error) {
    next(error);
  }
}

module.exports = { getContacts, getHistory };
