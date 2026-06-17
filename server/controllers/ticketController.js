import Ticket from "../models/ticketModel.js";

const VALID_SUBJECTS = [
  "Payment Issue",
  "Credits Issue",
  "Video Not Loading",
  "Account Issue",
  "Other",
];

// ─── CREATE TICKET ───
export const createTicket = async (req, res) => {
  try {
    const { subject, message } = req.body;
    const userId = req.user._id;

    if (!subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Subject and message are required.",
      });
    }

    if (!VALID_SUBJECTS.includes(subject)) {
      return res.status(400).json({
        success: false,
        message: "Invalid subject.",
      });
    }

    if (message.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: "Message must be at least 10 characters.",
      });
    }

    const ticket = await Ticket.create({ userId, subject, message });

    res.status(201).json({
      success: true,
      message: "Ticket created successfully.",
      ticket,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── GET MY TICKETS ───
export const getMyTickets = async (req, res) => {
  try {
    const userId = req.user._id;

    const tickets = await Ticket.find({ userId })
      .sort({ createdAt: -1 })
      .select("subject status replies createdAt updatedAt");

    res.status(200).json({
      success: true,
      tickets,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── GET SINGLE TICKET ───
export const getTicketById = async (req, res) => {
  try {
    const userId = req.user._id;
    const { ticketId } = req.params;

    const ticket = await Ticket.findOne({ _id: ticketId, userId });

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

// ─── USER REPLY ───
export const replyToTicket = async (req, res) => {
  try {
    const userId = req.user._id;
    const { ticketId } = req.params;
    const { message } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Reply message is required.",
      });
    }

    const ticket = await Ticket.findOne({ _id: ticketId, userId });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found.",
      });
    }

    if (ticket.status === "closed") {
      return res.status(400).json({
        success: false,
        message: "Cannot reply to a closed ticket.",
      });
    }

    ticket.replies.push({ sender: "user", message: message.trim() });
    await ticket.save();

    res.status(200).json({
      success: true,
      message: "Reply added.",
      ticket,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── ADMIN — GET ALL TICKETS ───
export const getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find()
      .populate("userId", "username")
      .sort({ createdAt: -1 })
      .select("subject status userId replies createdAt updatedAt");

    res.status(200).json({
      success: true,
      tickets,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── ADMIN — REPLY TO TICKET ───
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
      message: "Admin reply added.",
      ticket,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── ADMIN — CHANGE TICKET STATUS ───
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
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
