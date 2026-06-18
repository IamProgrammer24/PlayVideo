import express from "express";
import {
  createTicket,
  getMyTickets,
  getTicketById,
  replyToTicket,
  getAllTickets,
  adminReplyToTicket,
  changeTicketStatus,
} from "../controllers/ticketController.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";
import { getTicketbyId } from "../controllers/adminController.js";

const router = express.Router();

// ─── User routes ───
router.post("/create", protect, createTicket);
router.get("/my-tickets", protect, getMyTickets);
router.get("/:ticketId", protect, getTicketbyId);
router.post("/:ticketId/reply", protect, replyToTicket);

// ─── Admin routes ───
router.get("/admin/all", protect, adminOnly, getAllTickets);
router.post("/admin/:ticketId/reply", protect, adminOnly, adminReplyToTicket);
router.patch("/admin/:ticketId/status", protect, adminOnly, changeTicketStatus);

export default router;
