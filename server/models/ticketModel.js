import mongoose from "mongoose";

const replySchema = new mongoose.Schema(
  {
    sender: {
      type: String,
      enum: ["user", "admin"],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

const ticketSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    subject: {
      type: String,
      enum: [
        "Payment Issue",
        "Credits Issue",
        "Video Not Loading",
        "Account Issue",
        "Other",
      ],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["open", "in-progress", "closed"],
      default: "open",
    },
    replies: [replySchema],
  },
  { timestamps: true },
);

export default mongoose.model("Ticket", ticketSchema);
