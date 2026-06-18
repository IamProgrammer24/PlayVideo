import express from "express";
import {
  getStats,
  getAllUsers,
  resetUserPassword,
  getAllPayments,
  verifyPayment,
  getAllTickets,
  adminReplyToTicket,
  changeTicketStatus,
  getTicketbyId,
} from "../controllers/adminController.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

// all routes protected + admin only
router.use(protect, adminOnly);

// ─── Stats ───
router.get("/stats", getStats);

// ─── Users ───
router.get("/users", getAllUsers);
router.patch("/users/:userId/reset-password", resetUserPassword);

// ─── Payments ───
router.get("/payments", getAllPayments);
router.patch("/payments/:paymentId/verify", verifyPayment);

// ─── Tickets ───
router.get("/tickets", getAllTickets);
router.post("/tickets/:ticketId/reply", adminReplyToTicket);
router.patch("/tickets/:ticketId/status", changeTicketStatus);

export default router;
