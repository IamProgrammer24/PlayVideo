import express from "express";
import { getPlans } from "../controllers/planController.js";

const router = express.Router();

// Get all active plans
router.get("/", getPlans);

export default router;
