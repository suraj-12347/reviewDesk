import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import dotenv from "dotenv";
import Category from "../models/Category.js";

dotenv.config(); // ✅ Load env variables

const router = express.Router();

// Register Route
router.post("/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      reviewerCategory,
      country,
      state,
      district,
      affiliation,
      contactNumber,
    } = req.body;

    /* ========= BASIC VALIDATION ========= */

    if (!name || !email || !password || !country || !state || !district) {
      return res.status(400).json({
        message: "All required fields must be filled",
      });
    }

    /* ========= BLOCK ADMIN REGISTRATION ========= */

    if (role === "admin") {
      return res.status(403).json({
        message: "Admin registration is not allowed",
      });
    }

    /* ========= SAFE ROLE ASSIGNMENT ========= */

    const allowedRoles = ["user", "reviewer"];
    const safeRole = allowedRoles.includes(role) ? role : "user";

    /* ========= EMAIL NORMALIZATION ========= */

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    /* ========= REVIEWER VALIDATION ========= */

    let reviewerData = undefined;

    if (safeRole === "reviewer") {
      if (
        !reviewerCategory ||
        !reviewerCategory.mainCategory ||
        !reviewerCategory.subCategory
      ) {
        return res.status(400).json({
          message: "Category required for reviewer",
        });
      }

      const categoryDoc = await Category.findById(
        reviewerCategory.mainCategory
      );

      if (!categoryDoc) {
        return res.status(400).json({
          message: "Invalid main category",
        });
      }

      if (
        !categoryDoc.subCategories.includes(
          reviewerCategory.subCategory
        )
      ) {
        return res.status(400).json({
          message: "Invalid sub category",
        });
      }

      // 🔒 Prevent object injection
      reviewerData = {
        mainCategory: reviewerCategory.mainCategory,
        subCategory: reviewerCategory.subCategory,
      };
    }

    /* ========= PASSWORD HASH ========= */

    const hashedPassword = await bcrypt.hash(password, 12);

    /* ========= SAFE USER OBJECT ========= */

    const userData = {
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: safeRole,
      country,
      state,
      district,
      affiliation,
      contactNumber,
    };

    if (safeRole === "reviewer") {
      userData.reviewerCategory = reviewerData;
      userData.reviewerStatus = "pending"; // requires admin approval
    }

    /* ========= SAVE USER ========= */

    const user = await User.create(userData);

    /* ========= GENERATE TOKEN ========= */

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    /* ========= RESPONSE ========= */

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      userId: user._id,
      role: user.role,
    });

  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
});


// Login Route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, name: user.name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token, userId: user._id, name: user.name, role: user.role });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
