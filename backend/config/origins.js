// Trusted frontend origins (CLIENT_URL, comma separated). Used by Express CORS and Socket.IO.
function allowedOrigins() {
  const list = (process.env.CLIENT_URL || "http://localhost:5173")
    .split(",")
    .map((o) => o.trim().replace(/\/$/, ""))
    .filter(Boolean);
  if (process.env.NODE_ENV !== "production") {
    list.push("http://127.0.0.1:5173", "http://localhost:4173", "http://127.0.0.1:4173");
  }
  return [...new Set(list)];
}
module.exports = { allowedOrigins };
