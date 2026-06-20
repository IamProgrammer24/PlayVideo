import express from "express";
import {
  getLaunchStatus,
  setLaunchDate,
} from "../controllers/settingsController.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

// ─── Public — anyone logged in can see launch status ───
router.get("/launch-status", protect, getLaunchStatus);

// ─── Admin only — set/update launch date ───
router.patch("/launch-date", protect, adminOnly, setLaunchDate);

export default router;
