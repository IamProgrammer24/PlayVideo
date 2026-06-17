import mongoose from "mongoose";

const userActivitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    url: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
      default: "Unknown",
    },
    fileType: {
      type: String,
      default: "Unknown",
    },
    size: {
      type: String,
      default: "Unknown",
    },
    streamUrl: {
      type: String,
      default: null,
    },
    downloadUrl: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["success", "failed"],
      default: "success",
    },
  },
  { timestamps: true },
);

export default mongoose.model("UserActivity", userActivitySchema);
