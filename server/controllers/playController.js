import User from "../models/User.js";
import PlayCache from "../models/playCacheModel.js";
import axios from "axios";
import crypto from "crypto";

const generateUrlId = (url) => {
  return crypto.createHash("md5").update(url).digest("hex");
};

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
      // deduct credit (still charge user)
      user.credits -= 1;
      await user.save();

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
    await PlayCache.create({
      urlId,
      response: finalResponse,
    });

    // 5. DEDUCT CREDIT
    user.credits -= 1;
    await user.save();

    // 6. RETURN RESPONSE
    res.status(200).json({
      success: true,
      message: "Generated from API",
      play: finalResponse,
      remainingCredits: user.credits,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
