import mongoose from "mongoose";

const paperSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fileUrl: { type: String, required: true },
    status: {
      type: String,
      enum: ["Pending", "Reviewing", "Revisions", "Accepted", "Rejected"],
      default: "Pending",
    },
    reuploadCount: { type: Number, default: 0 },
    assignedReviewers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    reviews: [
      {
        reviewer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        comments: { type: String },
        status: {
          type: String,
          enum: ["Pending", "Approved", "Changes Required"],
          default: "Pending",
        },
        feedbackFileUrl: { type: String }, // ✅ NEW FIELD for feedback file
      },
    ],
  },
  { timestamps: true }
);

const Paper = mongoose.model("Paper", paperSchema);
export default Paper;
