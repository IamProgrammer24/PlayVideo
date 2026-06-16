import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import userRoutes from "./routes/UserRoutes.js";
import creditRoutes from "./routes/creditRoutes.js";
import cookieParser from "cookie-parser";
import playRoutes from "./routes/playRoutes.js";
import planRoutes from "./routes/planRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

dotenv.config();

const app = express();

// connect DB
connectDB();

app.use(express.json());
app.use(cookieParser());

app.use("/api/user", userRoutes);
app.use("/api/credits", creditRoutes);
app.use("/api/play", playRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/payment", paymentRoutes);

app.get("/", (req, res) => {
  res.send("API running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
