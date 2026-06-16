import mongoose from "mongoose";

const playCacheSchema = new mongoose.Schema(
  {
    urlId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    response: {
      type: Object,
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("PlayCache", playCacheSchema);
