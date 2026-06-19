import express from "express";
import {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
} from "../controllers/notificationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getMyNotifications);
router.patch("/:notificationId/read", protect, markAsRead);
router.patch("/mark-all-read", protect, markAllAsRead);

export default router;
