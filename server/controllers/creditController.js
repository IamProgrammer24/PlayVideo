import User from "../models/User.js";

// ========================
// ➕ ADD CREDITS
// ========================
export const addCredits = async (req, res) => {
  try {
    const { credits } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.credits += credits;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Credits added successfully",
      credits: user.credits,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ========================
// ➖ DEDUCT CREDITS
// ========================
export const deductCredits = async (req, res) => {
  try {
    const { credits } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.credits < credits) {
      return res.status(400).json({
        success: false,
        message: "Not enough credits",
      });
    }

    user.credits -= credits;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Credits deducted successfully",
      credits: user.credits,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ========================
// 📊 GET CREDITS
// ========================
export const getCredits = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      credits: user.credits,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
