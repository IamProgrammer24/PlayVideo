// server/middleware/authRateLimitMiddleware.js

const loginAttempts = new Map();

export const authRateLimiter = (req, res, next) => {
  const ip = req.ip || req.headers["x-forwarded-for"] || "unknown";
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 20; // 20 attempts per 15 min per IP

  const record = loginAttempts.get(ip);

  if (!record || now - record.windowStart > windowMs) {
    // New window
    loginAttempts.set(ip, { count: 1, windowStart: now });
    return next();
  }

  if (record.count >= maxAttempts) {
    return res.status(429).json({
      success: false,
      message: "Too many attempts. Please try again after 15 minutes.",
    });
  }

  record.count += 1;
  return next();
};
