import RateLimit from "../models/rateLimitModel.js";

export const rateLimiter = async (req, res, next) => {
  try {
    const userId = req.user._id;

    let record = await RateLimit.findOne({ userId });

    const now = new Date();

    // If no record → create new window
    if (!record) {
      record = await RateLimit.create({
        userId,
        count: 1,
        windowStart: now,
      });

      return next();
    }

    // Check time window (1 minute)
    const timeDiff = (now - record.windowStart) / 1000; // in seconds

    if (timeDiff > 60) {
      // reset window
      record.count = 1;
      record.windowStart = now;
      await record.save();
      return next();
    }

    // if limit exceeded
    if (record.count >= 10) {
      return res.status(429).json({
        success: false,
        message: "Rate limit exceeded. Max 10 requests per minute.",
      });
    }

    // increment count
    record.count += 1;
    await record.save();

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
