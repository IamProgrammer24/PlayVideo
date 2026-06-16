import express from "express";
import {
  addCredits,
  deductCredits,
  getCredits,
} from "../controllers/creditController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ========================
// ➕ ADD CREDITS
// ========================
router.post("/add", protect, addCredits);

// ========================
// ➖ DEDUCT CREDITS
// ========================
router.post("/deduct", protect, deductCredits);

// ========================
// 📊 GET CREDITS
// ========================
router.get("/balance", protect, getCredits);

export default router;
