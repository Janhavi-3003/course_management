// Converts Mongoose documents / lean objects into plain JSON:
// ObjectIds -> strings, adds `id` next to `_id`, removes __v.
function ser(value) {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) return value.map(ser);
  if (value instanceof Date) return value;
  if (value._bsontype === "ObjectId" || value._bsontype === "ObjectID") {
    return String(value);
  }
  if (typeof value.toObject === "function") value = value.toObject();
  if (typeof value === "object") {
    const out = {};
    for (const [key, val] of Object.entries(value)) {
      if (key === "__v") continue;
      out[key] = ser(val);
    }
    if (out._id) out.id = out._id;
    return out;
  }
  return value;
}
module.exports = ser;
