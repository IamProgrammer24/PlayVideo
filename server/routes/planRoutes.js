import express from "express";
import { getPlanById, getPlans } from "../controllers/planController.js";

const router = express.Router();

// Get all active plans
router.get("/", getPlans);

// Get plan via Id
router.get("/:id", getPlanById);

export default router;
