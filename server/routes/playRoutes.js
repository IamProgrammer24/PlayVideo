import express from "express";
import { generatePlay } from "../controllers/playController.js";
import { protect } from "../middleware/authMiddleware.js";
import { rateLimiter } from "../middleware/rateLimitMiddleware.js";

const router = express.Router();

// 🎬 GENERATE PLAY ROUTE
router.post("/generate", protect, rateLimiter, generatePlay);

export default router;
