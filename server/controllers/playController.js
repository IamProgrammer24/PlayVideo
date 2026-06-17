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

    // 1. check credits
    if (user.credits < 1) {
      return res.status(400).json({
        success: false,
        message: "Not enough credits",
      });
    }

    const urlId = generateUrlId(url);

    // 2. CHECK CACHE FIRST 🧠
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
        streamUrl: cached.response.stream_url || null, // ← add
        downloadUrl: cached.response.download_url || null, // ← add
        status: "success",
      });
      return res.status(200).json({
        success: true,
        message: "From cache",
        play: cached.response,
        remainingCredits: user.credits,
      });
    }

    // 3. CALL DISKWALA API
    const apiUrl = `https://diskwala.litedns.xyz/?token=${process.env.DISKWALA_TOKEN}&url=${encodeURIComponent(url)}`;
    const response = await axios.get(apiUrl);
    const data = response.data;

    if (!Array.isArray(data) || !data[0]) {
      await UserActivity.create({
        userId: user._id,
        url,
        status: "failed",
      });

      return res.status(500).json({
        success: false,
        message: "Invalid API response",
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

    // 4. SAVE TO CACHE 💾
    await PlayCache.create({ urlId, response: finalResponse });

    // 5. DEDUCT CREDIT
    user.credits -= 1;
    await user.save();

    // 6. SAVE ACTIVITY
    await UserActivity.create({
      userId: user._id,
      url,
      fileName: play.file_name || "Unknown",
      fileType: play.file_type || "Unknown",
      size: play.size || "Unknown",
      streamUrl: play.stream_url || null, // ← add
      downloadUrl: play.download_url || null, // ← add
      status: "success",
    });

    // 7. RETURN RESPONSE
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

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── GET USER ACTIVITY HISTORY ───
export const getUserActivity = async (req, res) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
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
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
