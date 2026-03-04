import express from "express";
import Category from "../models/Category.js";
import { authenticateUser,authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();


// ✅ 1. Get all categories
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


// ✅ 2. Add NEW main category
router.post("/main",  authenticateUser,
  authorizeRoles("admin"),async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Category name required" });
    }

    const existing = await Category.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const category = new Category({
      name,
      subCategories: []
    });

    await category.save();

    res.status(201).json(category);

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


// ✅ 3. Add SUBCATEGORY to existing main category
router.post("/sub",  authenticateUser,
  authorizeRoles("admin"),async (req, res) => {
  try {
    const { categoryId, subCategory } = req.body;

    if (!categoryId || !subCategory) {
      return res.status(400).json({ message: "categoryId and subCategory required" });
    }

    const category = await Category.findById(categoryId);

    if (!category) {
      return res.status(404).json({ message: "Main category not found" });
    }

    if (category.subCategories.includes(subCategory)) {
      return res.status(400).json({ message: "Subcategory already exists" });
    }

    category.subCategories.push(subCategory);
    await category.save();

    res.json(category);

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;