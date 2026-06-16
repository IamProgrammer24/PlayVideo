import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    utr: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    remarks: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
