const Notification = require("../models/Notification");
const { getIO } = require("../config/socket");
const ser = require("../utils/serialize");

// Saves a notification and pushes it to the recipient in real time.
async function notify(recipientId, message) {
  const notification = await Notification.create({
    recipient: recipientId,
    message: String(message).slice(0, 500)
  });
  const io = getIO();
  if (io) io.to(`user:${recipientId}`).emit("new_notification", ser(notification));
  return notification;
}

async function notifyMany(recipientIds, message) {
  if (!recipientIds.length) return [];
  const docs = await Notification.insertMany(
    recipientIds.map((recipient) => ({ recipient, message: String(message).slice(0, 500) }))
  );
  const io = getIO();
  if (io) docs.forEach((d) => io.to(`user:${d.recipient}`).emit("new_notification", ser(d)));
  return docs;
}

// Lets admin dashboards refresh live.
function emitAdmins(event, payload = {}) {
  const io = getIO();
  if (io) io.to("admins").emit(event, payload);
}

// Never let a failed notification break the main request.
const safeNotify = (...args) => notify(...args).catch((e) => console.error("notify failed:", e.message));

module.exports = { notify, notifyMany, emitAdmins, safeNotify };
