import Payment from "../models/Payment.js";
import Plan from "../models/Plan.js";
import User from "../models/User.js";

// User submits payment request
export const submitPaymentRequest = async (req, res) => {
  try {
    const { planId, utr } = req.body;

    if (!planId || !utr) {
      return res.status(400).json({
        success: false,
        message: "Plan and UTR are required",
      });
    }

    // Check if plan exists
    const plan = await Plan.findById(planId);

    if (!plan || !plan.isActive) {
      return res.status(404).json({
        success: false,
        message: "Invalid plan selected",
      });
    }

    // Check duplicate UTR
    const existingPayment = await Payment.findOne({
      utr: utr.trim().toUpperCase(),
    });

    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: "This UTR has already been submitted",
      });
    }

    const payment = await Payment.create({
      userId: req.user._id,
      planId: plan._id,
      amount: plan.price,
      utr: utr.trim().toUpperCase(),
    });

    return res.status(201).json({
      success: true,
      message: "Payment request submitted successfully",
      payment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// User payment history
export const getMyPaymentRequests = async (req, res) => {
  try {
    const payments = await Payment.find({
      userId: req.user._id,
    })
      .populate("planId", "name price plays")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      payments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Admin approves or rejects payment
export const verifyPaymentRequest = async (req, res) => {
  try {
    const { paymentId, status, remarks } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const payment = await Payment.findById(paymentId).populate("planId");

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    if (payment.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Payment already processed",
      });
    }

    payment.status = status;
    payment.remarks = remarks || "";

    await payment.save();

    // Add plays only if approved
    if (status === "approved") {
      const user = await User.findById(payment.userId);

      user.credits += payment.planId.plays;

      await user.save();
    }

    return res.status(200).json({
      success: true,
      message: `Payment ${status} successfully`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
