const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");
const Message = require("../models/Message");
const Notification = require("../models/Notification");
const { allowedOrigins } = require("./origins");
const ser = require("../utils/serialize");
const { clean } = require("../utils/sanitize");

let io = null;
const online = new Map(); // userId -> number of open sockets

function getIO() {
  return io;
}

function onlineIds() {
  return [...online.keys()];
}

function initializeSocket(httpServer) {
  io = new Server(httpServer, {
    cors: { origin: allowedOrigins(), methods: ["GET", "POST"] }
  });

  // Authenticate every socket connection with the JWT
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth && socket.handshake.auth.token;
      if (!token) return next(new Error("Authentication required"));
      const decoded = jwt.verify(token, process.env.JWT_SECRET, {
        algorithms: ["HS256"]
      });
      if (decoded.purpose) return next(new Error("Invalid authentication token"));
      const user = await User.findById(decoded.sub).select("_id name role");
      if (!user) return next(new Error("User not found"));
      socket.user = { id: String(user._id), name: user.name, role: user.role };
      next();
    } catch (error) {
      next(new Error("Invalid authentication token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user.id;
    // Each authenticated user has a private room
    socket.join(`user:${userId}`);
    if (socket.user.role === "admin") socket.join("admins");

    online.set(userId, (online.get(userId) || 0) + 1);
    io.emit("online_users", onlineIds());

    // Simple per-socket rate limit: 10 messages / 10 seconds
    let sent = [];

    socket.on("get_online_users", (ack) => {
      if (typeof ack === "function") ack(onlineIds());
    });

    socket.on("send_message", async (data, ack) => {
      const reply = typeof ack === "function" ? ack : () => {};
      try {
        const now = Date.now();
        sent = sent.filter((t) => now - t < 10000);
        if (sent.length >= 10) throw new Error("You are sending messages too fast");
        sent.push(now);

        const { recipientId, text } = data || {};
        if (
          !mongoose.isValidObjectId(recipientId) ||
          typeof text !== "string"
        ) {
          throw new Error("Invalid message data");
        }
        const cleaned = clean(text);
        if (!cleaned || cleaned.length > 2000) {
          throw new Error("Message must be 1-2000 characters");
        }
        if (String(recipientId) === userId) {
          throw new Error("You cannot message yourself");
        }
        const recipient = await User.findById(recipientId).select("_id");
        if (!recipient) throw new Error("Recipient not found");

        const message = await Message.create({
          sender: userId, // identity comes from the authenticated socket, never the client
          recipient: recipientId,
          text: cleaned
        });
        const payload = ser({
          _id: message._id,
          sender: userId,
          recipient: String(recipientId),
          text: message.text,
          createdAt: message.createdAt
        });
        io.to(`user:${userId}`)
          .to(`user:${recipientId}`)
          .emit("receive_message", payload);

        const notification = await Notification.create({
          recipient: recipientId,
          message: `New message from ${socket.user.name}`
        });
        io.to(`user:${recipientId}`).emit("new_notification", ser(notification));
        reply({ success: true });
      } catch (error) {
        reply({ success: false, message: error.message });
      }
    });

    socket.on("disconnect", () => {
      const left = (online.get(userId) || 1) - 1;
      if (left <= 0) online.delete(userId);
      else online.set(userId, left);
      io.emit("online_users", onlineIds());
    });
  });
  return io;
}

module.exports = initializeSocket;
module.exports.getIO = getIO;
