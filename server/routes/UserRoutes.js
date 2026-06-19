import express from "express";

// import your controllers
import {
  registerUser,
  loginUser,
  getMe,
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

// EXPORT ROUTER
export default router;
