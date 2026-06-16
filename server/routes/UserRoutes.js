import express from "express";

// import your controllers
import { registerUser, loginUser } from "../controllers/userController.js";

const router = express.Router();

// ========================
// 👤 REGISTER ROUTE
// ========================
router.post("/register", registerUser);

// ========================
// 🔑 LOGIN ROUTE
// ========================
router.post("/login", loginUser);

// EXPORT ROUTER
export default router;
