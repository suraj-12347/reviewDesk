import express from "express";
import Paper from "../models/Paper.js";
import User from "../models/User.js";
import { authenticateUser, authenticateAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all users (for admin)
router.get("/users/:id", authenticateAdmin, async (req, res) => {
  try {
    const id= req.user.id;
    const users = await User.findOne({_id:id}); // Exclude password
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
router.get("/users", authenticateAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password"); // Exclude password
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get all papers
router.get("/papers",authenticateUser, authenticateAdmin, async (req, res) => {
  try {
    const papers = await Paper.find().populate("author", "name email"); 
    res.json(papers);
  } catch (error) {
    res.status(500).json({ error: "Error fetching papers" });
  }
});

// Get all reviewer
router.get("/reviewers", authenticateAdmin, async (req, res) => {
  try {
    const reviewers = await User.find({ role: "reviewer" }).select("name email");
    res.json(reviewers);
  } catch (error) {
    console.error("Error fetching reviewers:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Assign paper to a reviewer
router.put("/assign-reviewer", authenticateAdmin, async (req, res) => {
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
router.put("/update-status", authenticateUser, async (req, res) => {
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

export default router;
