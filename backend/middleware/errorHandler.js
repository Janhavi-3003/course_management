function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  if (err.code === 11000) {
    return res.status(409).json({ message: "Duplicate value already exists" });
  }
  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: "Validation failed",
      errors: Object.values(err.errors).map((item) => item.message)
    });
  }
  if (err.name === "CastError") {
    return res.status(400).json({ message: "Invalid identifier" });
  }
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Malformed JSON body" });
  }
  if (err.type === "entity.too.large") {
    return res.status(413).json({ message: "Request body too large" });
  }

  const status =
    Number.isInteger(err.status) && err.status >= 400 && err.status < 600
      ? err.status
      : 500;

  if (status >= 500) {
    console.error(err);
  } else if (process.env.NODE_ENV !== "test") {
    console.warn(`[${status}] ${req.method} ${req.originalUrl} - ${err.message}`);
  }

  res.status(status).json({
    message: status === 500 ? "Internal server error" : err.message
  });
}
module.exports = errorHandler;
