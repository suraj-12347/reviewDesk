import mongoose from "mongoose";

const ReviewerCategorySchema = new mongoose.Schema({
  mainCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  subCategory: {
    type: String,
    required: true,
  }
}, { _id: false });

const UserSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },

  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },

  password: { 
    type: String, 
    required: true 
  },

  role: { 
    type: String, 
    enum: ["user", "reviewer", "admin"], 
    default: "user" 
  },

  // 📍 Always Required
  country: { 
    type: String, 
    required: true,
    trim: true
  },

  state: { 
    type: String, 
    required: true,
    trim: true
  },

  district: { 
    type: String, 
    required: true,
    trim: true
  },

  // Professional Fields (optional for now)
  affiliation: { 
    type: String,
    trim: true
  },

  contactNumber: { 
    type: String,
    trim: true
  },

  reviewerCategory: {
    type: ReviewerCategorySchema,
    required: function () {
      return this.role === "reviewer";
    }
  }

}, { timestamps: true });

const User = mongoose.model("User", UserSchema);
export default User;