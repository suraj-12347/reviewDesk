import express from "express";
import Paper from "../models/Paper.js";
import { authenticateReviewer } from "../middleware/authMiddleware.js";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const router = express.Router();

// Multer setup

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const feedbackDir = path.join('uploads', 'feedback');
if (!fs.existsSync(feedbackDir)) {
  fs.mkdirSync(feedbackDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join("uploads", "feedback"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});


const upload = multer({ storage });


// Route: Submit feedback
router.put(
  "/review-paper/:paperId",
  authenticateReviewer,
  upload.single("file"),
  async (req, res) => {
    try {
      const { paperId } = req.params;
      const reviewerId = req.user.id;
      const { comments, status } = req.body;
      const feedbackFile = req.file;

      const paper = await Paper.findById(paperId);
      if (!paper) {
        return res.status(404).json({ message: "Paper not found" });
      }

      let reviewIndex = paper.reviews.findIndex(
        (r) => r.reviewer.toString() === reviewerId
      );

      if (reviewIndex === -1) {
        // Add a new review entry for this reviewer
        paper.reviews.push({
          reviewer: reviewerId,
          comments,
          status,
          feedbackFileUrl: feedbackFile
            ? `/uploads/feedback/${feedbackFile.filename}`
            : null,
        });
      } else {
        // Update existing review
        paper.reviews[reviewIndex].comments = comments;
        paper.reviews[reviewIndex].status = status;

        if (feedbackFile) {
          paper.reviews[reviewIndex].feedbackFileUrl = `/uploads/feedback/${feedbackFile.filename}`;
        }
      }

      await paper.save();
      res.json({ message: "Feedback submitted successfully" });
    } catch (error) {
      console.error("Review error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);



// Get Assigned Papers (Only for the logged-in reviewer)
router.get("/assigned-papers", authenticateReviewer, async (req, res) => {
  try {
    const papers = await Paper.find({
      assignedReviewers: req.user._id,
    }).populate("author", "name email");

    res.status(200).json(papers);
  } catch (error) {
    console.error("Error fetching assigned papers:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Submit Feedback (Only for assigned papers)
router.post("/submit-feedback", authenticateReviewer, async (req, res) => {
  try {
    const { paperId, feedback } = req.body;
    const paper = await Paper.findById(paperId);
    if (!paper) {
      return res.status(404).json({ error: "Paper not found" });
    }
    if (!paper.assignedReviewers.includes(req.user.id)) {
      return res.status(403).json({ error: "Not authorized to review this paper" });
    }
    const existingReview = paper.reviews.find(
      (review) => review.reviewer.toString() === req.user.id
    );

    if (existingReview) {
      existingReview.comments = feedback;
    } else {
      paper.reviews.push({
        reviewer: req.user.id,
        comments: feedback,
        status: "pending",
      });
    }
    console.log("Fetched Papers:", response.data);
    await paper.save();

    res.json({ message: "Feedback submitted successfully" });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// router.put("/review-paper/:paperId", authenticateReviewer, upload.single("file"), async (req, res) => {
//   const { comments, status } = req.body;
//   const { paperId } = req.params;

//   try {
//     const paper = await Paper.findById(paperId);
//     if (!paper) {
//       return res.status(404).json({ error: "Paper not found" });
//     }

//     const reviewerId = req.user._id;

//     // Check if reviewer has already submitted feedback
//     const existingReview = paper.reviews.find(
//       (r) => r.reviewer.toString() === reviewerId.toString()
//     );

//     const feedbackData = {
//       reviewer: reviewerId,
//       comments,
//       status,
//     };

//     if (req.file) {
//       feedbackData.feedbackFile = "/uploads/feedbacks/" + req.file.filename;
//     }

//     if (existingReview) {
//       existingReview.comments = feedbackData.comments;
//       existingReview.status = feedbackData.status;
//       if (feedbackData.feedbackFile) {
//         existingReview.feedbackFile = feedbackData.feedbackFile;
//       }
//     } else {
//       paper.reviews.push(feedbackData);
//     }

//     await paper.save();
//     res.status(200).json({ message: "Feedback submitted", paper });
//   } catch (err) {
//     console.error("Error submitting feedback:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

router.get("/download-paper/:id", authenticateReviewer, async (req, res) => {
  try {
    const paper = await Paper.findById(req.params.id);

    if (!paper) {
      return res.status(404).json({ error: "Paper not found" });
    }
    const filePath = path.resolve(paper.fileUrl);
    res.download(filePath);
  } catch (error) {
    console.error("Error downloading paper:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/feedback/:filename", (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, "..", "uploads", "feedback", filename);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.log("File not found:", filePath); // Debug log
      return res.status(404).json({ message: "Feedback file not found" });
    }

    res.sendFile(filePath);
  });
});


export default router;
