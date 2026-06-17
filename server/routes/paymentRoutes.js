import express from "express";
import {
  submitPaymentRequest,
  getMyPaymentRequests,
  verifyPaymentRequest,
} from "../controllers/paymentRequestController.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

// User submits payment request
router.post("/submit", protect, submitPaymentRequest);

// User payment history
router.get("/my-payments", protect, getMyPaymentRequests);

// Admin verifies payment
router.patch("/verify", protect, adminOnly, verifyPaymentRequest);

export default router;
