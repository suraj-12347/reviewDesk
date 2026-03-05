import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  comments: { type: String },

  status: {
    type: String,
    enum: ["Pending", "Approved", "Changes Required", "Rejected"],
    default: "Pending",
  },

  feedbackFileUrl: { type: String },

  evaluation: {
    originality: {
      score: { type: Number, min: 1, max: 5, required: true },
      comment: String,
    },
    technicalQuality: {
      score: { type: Number, min: 1, max: 5, required: true },
      comment: String,
    },
    methodology: {
      score: { type: Number, min: 1, max: 5, required: true },
      comment: String,
    },
    clarity: {
      score: { type: Number, min: 1, max: 5, required: true },
      comment: String,
    },
    relevance: {
      score: { type: Number, min: 1, max: 5, required: true },
      comment: String,
    },
    literatureReview: {
      score: { type: Number, min: 1, max: 5, required: true },
      comment: String,
    },
    overallRecommendation: {
      type: String,
      enum: ["Accept", "Minor Revision", "Major Revision", "Reject"],
      required: true,
    },
  },
}, { timestamps: true });

const paperSchema = new mongoose.Schema(
{
  title: { type: String, required: true },

  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  fileUrl: { type: String, required: true },

  // ✅ Plagiarism Report (Paper Level)
  plagiarismReportUrl: { 
    type: String 
  },

  plagiarismPercentage: { 
    type: Number,
    min: 0,
    max: 100
  },

  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },

  subCategory: { type: String },

  status: {
    type: String,
    enum: ["Pending", "Reviewing", "Revisions", "Accepted", "Rejected"],
    default: "Pending",
  },

  reuploadCount: { type: Number, default: 0 },

  assignedReviewers: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  ],

  reviews: [reviewSchema],

},
{ timestamps: true }
);

const Paper = mongoose.model("Paper", paperSchema);
export default Paper;