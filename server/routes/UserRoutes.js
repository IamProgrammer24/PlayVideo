import express from "express";

// import your controllers
import {
  registerUser,
  loginUser,
  getMe,
  getReferralStats,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

import { authRateLimiter } from "../middleware/authRateLimitMiddleware.js";

const router = express.Router();

// ========================
// 👤 REGISTER ROUTE
// ========================
router.post("/register", authRateLimiter, registerUser);

// ========================
// 🔑 LOGIN ROUTE
// ========================
router.post("/login", authRateLimiter, loginUser);

router.get("/me", protect, getMe);

router.get("/referral-stats", protect, getReferralStats);

// EXPORT ROUTER
export default router;
