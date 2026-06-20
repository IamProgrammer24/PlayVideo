import Settings from "../models/settingsModel.js";
import User from "../models/User.js";

const TARGET_INTERESTED = 100;

// ─── GET LAUNCH STATUS (public, no auth needed) ───
export const getLaunchStatus = async (req, res) => {
  try {
    const launchSetting = await Settings.findOne({ key: "launchDate" });

    // total registered non-admin users = "interested" count
    const interestedCount = await User.countDocuments({ isAdmin: false });

    res.status(200).json({
      success: true,
      launchDate: launchSetting?.value || null,
      interestedCount,
      targetInterested: TARGET_INTERESTED,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
};

// ─── ADMIN — SET LAUNCH DATE ───
export const setLaunchDate = async (req, res) => {
  try {
    const { launchDate } = req.body;

    if (!launchDate || isNaN(new Date(launchDate).getTime())) {
      return res.status(400).json({
        success: false,
        message: "A valid launch date is required.",
      });
    }

    const updated = await Settings.findOneAndUpdate(
      { key: "launchDate" },
      { value: new Date(launchDate) },
      { upsert: true, new: true },
    );

    res.status(200).json({
      success: true,
      message: "Launch date updated.",
      launchDate: updated.value,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
};
