// Removes HTML tags / control characters from user text (basic XSS hardening).
function clean(value) {
  return String(value)
    .replace(/<[^>]*>/g, "")
    .replace(/[<>]/g, "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .trim();
}

// Escapes a string for safe use inside a RegExp (search queries).
function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

module.exports = { clean, escapeRegex };
