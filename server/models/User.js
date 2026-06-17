import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    password: {
      type: String,
      required: true, // keep optional for MVP if you want simple login later
    },

    credits: {
      type: Number,
      default: 0, // start with 0 credits
    },

    plan: {
      type: String,
      default: "none", // none | starter | pro etc
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

export default User;
