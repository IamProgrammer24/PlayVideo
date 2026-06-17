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

export const getPlanById = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id).select("-__v");

    if (!plan || !plan.isActive) {
      return res.status(404).json({
        success: false,
        message: "Plan not found",
      });
    }

    return res.status(200).json({
      success: true,
      plan,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch plan",
      error: error.message,
    });
  }
};
