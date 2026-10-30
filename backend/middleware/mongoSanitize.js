// Blocks NoSQL operator injection: removes keys starting with "$" or containing "."
function strip(value) {
  if (Array.isArray(value)) return value.map(strip);
  if (value && typeof value === "object") {
    const out = {};
    for (const [key, val] of Object.entries(value)) {
      if (key.startsWith("$") || key.includes(".")) continue;
      out[key] = strip(val);
    }
    return out;
  }
  return value;
}

function mongoSanitize(req, res, next) {
  if (req.body) req.body = strip(req.body);
  if (req.params) req.params = strip(req.params);
  if (req.query) {
    const q = strip(req.query);
    for (const k of Object.keys(req.query)) delete req.query[k];
    Object.assign(req.query, q);
  }
  next();
}
module.exports = mongoSanitize;
