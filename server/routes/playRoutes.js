import express from "express";
import {
  generatePlay,
  getUserActivity,
} from "../controllers/playController.js";
import { protect } from "../middleware/authMiddleware.js";
import { rateLimiter } from "../middleware/rateLimitMiddleware.js";

const router = express.Router();

// 🎬 GENERATE PLAY
router.post("/generate", protect, rateLimiter, generatePlay);

// 📋 GET USER ACTIVITY HISTORY
router.get("/history", protect, getUserActivity);

export default router;
