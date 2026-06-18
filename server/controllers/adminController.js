import User from "../models/User.js";
import Payment from "../models/Payment.js";
import Ticket from "../models/ticketModel.js";
import UserActivity from "../models/userActivityModel.js";
import bcrypt from "bcryptjs";

// ─── GET STATS ───
export const getStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      totalPayments,
      pendingPayments,
      totalTickets,
      openTickets,
      playsToday,
      revenueData,
    ] = await Promise.all([
      User.countDocuments({ isAdmin: false }),
      Payment.countDocuments(),
      Payment.countDocuments({ status: "pending" }),
      Ticket.countDocuments(),
      Ticket.countDocuments({ status: { $in: ["open", "in-progress"] } }),
      UserActivity.countDocuments({ createdAt: { $gte: today } }),
      Payment.aggregate([
        { $match: { status: "approved" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
    ]);

    const totalRevenue = revenueData[0]?.total || 0;

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalPayments,
        pendingPayments,
        totalTickets,
        openTickets,
        playsToday,
        totalRevenue,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET ALL USERS ───
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ isAdmin: false })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── RESET USER PASSWORD ───
export const resetUserPassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.trim().length < 4) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 4 characters.",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Password reset successfully for ${user.username}.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET ALL PAYMENTS ───
export const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("userId", "username")
      .populate("planId", "name price plays")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── VERIFY PAYMENT (approve/reject) ───
export const verifyPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { status, remarks } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be approved or rejected.",
      });
    }

    const payment = await Payment.findById(paymentId).populate("planId");

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found.",
      });
    }

    if (payment.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Payment already processed.",
      });
    }

    payment.status = status;
    if (remarks) payment.remarks = remarks;
    await payment.save();

    // ─── If approved → add credits to user ───
    if (status === "approved") {
      const user = await User.findById(payment.userId);
      if (user) {
        user.credits += payment.planId.plays;
        user.plan = payment.planId.name;
        await user.save();
      }
    }

    res.status(200).json({
      success: true,
      message: `Payment ${status} successfully.`,
      payment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET ALL TICKETS ───
export const getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find()
      .populate("userId", "username")
      .sort({ createdAt: -1 })
      .select("subject status userId replies createdAt updatedAt");

    res.status(200).json({ success: true, tickets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// ─── GET TICKET BY ID ───
export const getTicketbyId = async (req, res) => {
  try {
    const { ticketId } = req.params;

    const ticket = await Ticket.findById(ticketId)
      .populate("userId", "username")
      .select("subject message status userId replies createdAt updatedAt");

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found.",
      });
    }

    res.status(200).json({
      success: true,
      ticket,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── ADMIN REPLY TO TICKET ───
export const adminReplyToTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { message } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Reply message is required.",
      });
    }

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found.",
      });
    }

    ticket.replies.push({ sender: "admin", message: message.trim() });
    await ticket.save();

    res.status(200).json({
      success: true,
      message: "Reply added.",
      ticket,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── CHANGE TICKET STATUS ───
export const changeTicketStatus = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { status } = req.body;

    if (!["open", "in-progress", "closed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status.",
      });
    }

    const ticket = await Ticket.findByIdAndUpdate(
      ticketId,
      { status },
      { new: true },
    );

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: `Ticket marked as ${status}.`,
      ticket,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
