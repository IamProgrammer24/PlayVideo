import mongoose from "mongoose";

const rateLimitSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    count: {
      type: Number,
      default: 0,
    },

    windowStart: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

export default mongoose.model("RateLimit", rateLimitSchema);
