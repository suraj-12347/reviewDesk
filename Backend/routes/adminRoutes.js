import express from "express";
import Paper from "../models/Paper.js";
import User from "../models/User.js";
import Category from "../models/Category.js";
import { authenticateUser, authorizeRoles } from "../middleware/authMiddleware.js";
import bcrypt from "bcryptjs";

const router = express.Router();

// Get all users (for admin)
router.get("/users/:id", authenticateUser,
  authorizeRoles("admin"), async (req, res) => {
  try {
    const id= req.user.id;
    const users = await User.findOne({_id:id}); // Exclude password
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
router.get("/users",authenticateUser,
  authorizeRoles("admin"), async (req, res) => {
  try {
    const users = await User.find().select("-password"); // Exclude password
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get all papers
router.get(
  "/papers",
  authenticateUser,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
     const papers = await Paper.find()
  .populate("author", "name email")
  .populate("category", "name subCategories")
  .populate("reviews.reviewer", "name email"); // ✅ add this



      res.json(papers);
    } catch (error) {
      res.status(500).json({ error: "Error fetching papers" });
    }
  }
);

// Get all reviewer
router.get(
  "/reviewers",
  authenticateUser,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const reviewers = await User.find({ role: "reviewer" })
        .select("name email reviewerCategory") // reviewerCategory include karo
        .populate("reviewerCategory.mainCategory", "name"); // populate mainCategory name
      res.json(reviewers);
    } catch (error) {
      console.error("Error fetching reviewers:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);
// Assign paper to a reviewer
router.put("/assign-reviewer", authenticateUser,
  authorizeRoles("admin"), async (req, res) => {
  const { paperId, reviewerId } = req.body;

  try {
    const paper = await Paper.findById(paperId);

    if (!paper) {
      return res.status(404).json({ error: "Paper not found" });
    }

    // add reviewer to assignedReviewers array if not already present
    if (!paper.assignedReviewers.includes(reviewerId)) {
      paper.assignedReviewers.push(reviewerId);
    }

    paper.status = "Reviewing";
    await paper.save();
    res.status(200).json({ message: "Reviewer assigned successfully", paper });
  } catch (error) {
    console.error("Error assigning reviewer:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Update paper status (Approve/Reject)
router.put("/update-status", authenticateUser,
  authorizeRoles("admin"), async (req, res) => {
  try {
    const { paperId, status } = req.body;
    if (!paperId || !status) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const paper = await Paper.findByIdAndUpdate(
      paperId,
      { status },
      { new: true }
    );

    if (!paper) {
      return res.status(404).json({ error: "Paper not found" });
    }
    res.status(200).json({ message: `Paper status updated to ${status}`, paper });
  } catch (error) {
    console.error("Error updating paper status:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// create reviewer

// Register new reviewer (Admin only)
router.post(
  "/register-reviewer",
  authenticateUser,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const {
        name,
        email,
        password,
        country,
        state,
        district,
        reviewerCategory,
      } = req.body;

      /* ========= BASIC VALIDATION ========= */

      if (
        !name ||
        !email ||
        !password ||
        !country ||
        !state ||
        !district ||
        !reviewerCategory?.mainCategory ||
        !reviewerCategory?.subCategory
      ) {
        return res.status(400).json({
          error: "All fields are required",
        });
      }

      if (password.length < 8) {
        return res.status(400).json({
          error: "Password must be at least 8 characters",
        });
      }

      /* ========= EMAIL NORMALIZATION ========= */

      const normalizedEmail = email.toLowerCase().trim();

      const existingUser = await User.findOne({
        email: normalizedEmail,
      });

      if (existingUser) {
        return res.status(400).json({
          error: "Email already registered",
        });
      }

      /* ========= CATEGORY VALIDATION ========= */

      const categoryDoc = await Category.findById(
        reviewerCategory.mainCategory
      );

      if (!categoryDoc) {
        return res.status(400).json({
          error: "Invalid main category",
        });
      }

      if (
        !categoryDoc.subCategories.includes(
          reviewerCategory.subCategory
        )
      ) {
        return res.status(400).json({
          error: "Invalid sub category",
        });
      }

      /* ========= HASH PASSWORD ========= */

      const hashedPassword = await bcrypt.hash(password, 12);

      /* ========= CREATE SAFE REVIEWER ========= */

      const reviewer = await User.create({
        name,
        email: normalizedEmail,
        password: hashedPassword,
        role: "reviewer",
        country,
        state,
        district,
        reviewerCategory: {
          mainCategory: reviewerCategory.mainCategory,
          subCategory: reviewerCategory.subCategory,
        },
        reviewerStatus: "approved", // since admin is creating
      });

      /* ========= RESPONSE ========= */

      res.status(201).json({
        success: true,
        message: "Reviewer registered successfully",
        reviewer: {
          _id: reviewer._id,
          name: reviewer.name,
          email: reviewer.email,
          role: reviewer.role,
        },
      });

    } catch (error) {
      console.error("Error registering reviewer:", error);
      res.status(500).json({
        error: "Server error",
      });
    }
  }
);
export default router;
