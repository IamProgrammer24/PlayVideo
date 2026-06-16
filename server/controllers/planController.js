import Plan from "../models/Plan.js";

export const getPlans = async (req, res) => {
  try {
    const plans = await Plan.find({ isActive: true })
      .select("-__v")
      .sort({ price: 1 });

    return res.status(200).json({
      success: true,
      count: plans.length,
      plans,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch plans",
      error: error.message,
    });
  }
};
