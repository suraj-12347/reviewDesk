import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import Paper from "../models/Paper.js";
import { authenticateAdmin, authenticateUser } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create uploads folder if not exists
const UPLOAD_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
}

// Multer Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.resolve("uploads"); 
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "application/pdf" ||
      file.mimetype === "application/msword" ||
      file.mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only PDF and Word documents are allowed."));
    }
  },
});

// Upload Paper Route
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const { title, author } = req.body;

    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const newPaper = new Paper({
      title,
      author,
      fileUrl: `/uploads/${req.file.filename}`,
      status: "Pending",
      reuploadCount: 0, // Initial reupload count
    });

    await newPaper.save();
    res.status(201).json(newPaper);
  } catch (error) {
    console.error("Error uploading paper:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Reupload Paper
router.post("/reupload/:paperId", upload.single("file"), async (req, res) => {
  try {
    const { paperId } = req.params;

    const paper = await Paper.findById(paperId);
    if (!paper) {
      return res.status(404).json({ message: "Paper not found" });
    }

    // Stop if max attempts reached
    if ((paper.reuploadCount || 1) >= 3) {
      return res.status(400).json({
        message: "Maximum reupload attempts reached",
      });
    }

    if (!req.file) {
      return res.status(400).json({ message: "File is required" });
    }

    // Update only what is needed
    paper.fileUrl = `/uploads/${req.file.filename}`;
    paper.reuploadCount = (paper.reuploadCount || 1) + 1;
    paper.status = "Pending";

    await paper.save();

    res.status(200).json(paper);
  } catch (error) {
    console.error("Error reuploading paper:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Get Papers (User-specific)
router.get("/my-papers",authenticateUser, async (req, res) => {
  try {
     console.log(req.user);
    const authorId = req.user.id;
   
    // const papers = await Paper.find({ author: userId }).lean(); // make sure you get all fields
    const papers = await Paper.findOne({author:authorId})
    console.log("all papers ",papers)
    res.status(200).json(papers);;
  } catch (error) {
    console.error("Error fetching papers:", error);
    res.status(500).json({ message: "Server Error" });
  }
});
router.get("/all-papers",authenticateAdmin, async (req, res) => {
  try {
     console.log(req.user);
    const authorId = req.user.id;
   
    // const papers = await Paper.find({ author: userId }).lean(); // make sure you get all fields
    const papers = await Paper.find({});
    console.log("all papers ",papers)
    res.status(200).json(papers);;
  } catch (error) {
    console.error("Error fetching papers:", error);
    res.status(500).json({ message: "Server Error" });
  }
});



// Download Route
router.get("/download/:filename", (req, res) => {
  const filePath = path.join(UPLOAD_DIR, req.params.filename);

  if (fs.existsSync(filePath)) {
    res.download(filePath, (err) => {
      if (err) {
        console.error("Download error:", err);
        res.status(500).json({ error: "Failed to download file" });
      }
    });
  } else {
    res.status(404).json({ error: "File not found" });
  }
});

router.get("/feedback-file/:paperId/:reviewerId", async (req, res) => {
  try {
    const { paperId, reviewerId } = req.params;

    const paper = await Paper.findById(paperId);
    if (!paper) return res.status(404).json({ error: "Paper not found" });

    const review = paper.reviews.find(
      (r) => r.reviewer.toString() === reviewerId
    );

    if (!review || !review.feedbackFileUrl) {
      return res.status(404).json({ error: "Feedback file not found" });
    }

    const filePath = path.join(process.cwd(), review.feedbackFileUrl);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File does not exist" });
    }

    res.sendFile(filePath);
  } catch (err) {
    console.error("Error fetching feedback file:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
