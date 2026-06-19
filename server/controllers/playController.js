import User from "../models/User.js";
import PlayCache from "../models/playCacheModel.js";
import UserActivity from "../models/userActivityModel.js";
import axios from "axios";
import crypto from "crypto";

const generateUrlId = (url) => {
  return crypto.createHash("md5").update(url).digest("hex");
};

// ─── GENERATE PLAY ───
export const generatePlay = async (req, res) => {
  try {
    const user = req.user;
    const { url } = req.body;

    // 1. VALIDATE INPUT
    if (!url || typeof url !== "string") {
      return res.status(400).json({
        success: false,
        message: "URL is required",
      });
    }

    let parsedUrl;
    try {
      parsedUrl = new URL(url.trim());
    } catch {
      return res.status(400).json({
        success: false,
        message: "Invalid URL format",
      });
    }

    // Only allow http and https
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return res.status(400).json({
        success: false,
        message: "Invalid URL",
      });
    }

    // Block internal addresses (SSRF protection)
    const blockedHosts = [
      "localhost",
      "127.0.0.1",
      "169.254.169.254",
      "0.0.0.0",
      "::1",
    ];
    if (blockedHosts.some((b) => parsedUrl.hostname.includes(b))) {
      return res.status(400).json({
        success: false,
        message: "Invalid URL",
      });
    }

    // 2. CHECK CREDITS
    if (user.credits < 1) {
      return res.status(400).json({
        success: false,
        message: "Not enough credits",
      });
    }

    // 3. CHECK CACHE 🧠
    const urlId = generateUrlId(url.trim());
    const cached = await PlayCache.findOne({ urlId });

    if (cached) {
      user.credits -= 1;
      await user.save();

      await UserActivity.create({
        userId: user._id,
        url,
        fileName: cached.response.file_name || "Unknown",
        fileType: cached.response.file_type || "Unknown",
        size: cached.response.size || "Unknown",
        streamUrl: cached.response.stream_url || null,
        downloadUrl: cached.response.download_url || null,
        status: "success",
      });

      return res.status(200).json({
        success: true,
        message: "From cache",
        play: cached.response,
        remainingCredits: user.credits,
      });
    }

    // 4. CALL DISKWALA API
    let data;
    try {
      const apiUrl = `https://diskwala.litedns.xyz/?token=${process.env.DISKWALA_TOKEN}&url=${encodeURIComponent(url.trim())}`;
      const response = await axios.get(apiUrl, { timeout: 15000 });
      data = response.data;
    } catch (apiError) {
      await UserActivity.create({
        userId: user._id,
        url,
        status: "failed",
      }).catch(() => {});

      return res.status(502).json({
        success: false,
        message: "Failed to reach video API. Try again.",
      });
    }

    if (!Array.isArray(data) || !data[0]) {
      await UserActivity.create({
        userId: user._id,
        url,
        status: "failed",
      }).catch(() => {});

      return res.status(422).json({
        success: false,
        message:
          "Could not process this URL. Make sure it's a supported video link.",
      });
    }

    const play = data[0];

    const finalResponse = {
      stream_url: play.stream_url,
      download_url: play.download_url,
      file_name: play.file_name,
      file_type: play.file_type,
      size: play.size,
      sizebytes: play.sizebytes,
      link: play.link,
    };

    // 5. SAVE TO CACHE 💾
    await PlayCache.create({ urlId, response: finalResponse });

    // 6. DEDUCT CREDIT
    user.credits -= 1;
    await user.save();

    // 7. SAVE ACTIVITY
    await UserActivity.create({
      userId: user._id,
      url,
      fileName: play.file_name || "Unknown",
      fileType: play.file_type || "Unknown",
      size: play.size || "Unknown",
      streamUrl: play.stream_url || null,
      downloadUrl: play.download_url || null,
      status: "success",
    });

    // 8. RETURN RESPONSE
    res.status(200).json({
      success: true,
      message: "Generated from API",
      play: finalResponse,
      remainingCredits: user.credits,
    });
  } catch (error) {
    if (req.user?._id && req.body?.url) {
      await UserActivity.create({
        userId: req.user._id,
        url: req.body.url,
        status: "failed",
      }).catch(() => {});
    }

    console.error("generatePlay error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
};

// ─── GET USER ACTIVITY HISTORY ───
export const getUserActivity = async (req, res) => {
  try {
    const userId = req.user._id;
    const limit = Math.min(parseInt(req.query.limit) || 10, 50); // max 50
    const page = Math.max(parseInt(req.query.page) || 1, 1); // min page 1
    const skip = (page - 1) * limit;

    const activities = await UserActivity.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select(
        "url fileName fileType size streamUrl downloadUrl status createdAt",
      );

    const total = await UserActivity.countDocuments({ userId });

    res.status(200).json({
      success: true,
      activities,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("getUserActivity error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
};
