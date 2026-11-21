export function notFound(req, res, next) {
  res.status(404);
  next(new Error(`Route not found: ${req.method} ${req.originalUrl}`));
}

export function errorHandler(error, req, res, next) {
  const status = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  if (error.name === "ValidationError") return res.status(400).json({ message: error.message });
  if (error.code === 11000) return res.status(409).json({ message: "A record with this value already exists" });
  if (error.name === "CastError") return res.status(400).json({ message: "Invalid record identifier" });
  if (status >= 500) console.error(error);
  return res.status(status).json({ message: error.message || "Internal server error" });
}
