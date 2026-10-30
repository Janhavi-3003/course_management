function statusFromPercent(p) {
  if (p >= 100) return "Completed";
  if (p >= 80) return "Almost Done";
  if (p <= 0) return "Not Started";
  if (p <= 25) return "Just Started";
  return "In Progress";
}
module.exports = { statusFromPercent };
