const express = require("express");
const Category = require("../models/Category");

const router = express.Router();

// GET all categories
router.get("/", async (req, res) => {
    try {
        const categories = await Category.find()
            .populate("billboard")
            .sort({ name: 1 });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch categories", error: error.message });
    }
});

// GET single category by slug or id
router.get("/:idOrSlug", async (req, res) => {
    try {
        const param = req.params.idOrSlug;
        let category = null;
        if (param.match(/^[0-9a-fA-F]{24}$/)) {
            category = await Category.findById(param).populate("billboard");
        }
        if (!category) {
            category = await Category.findOne({ slug: param.toLowerCase() }).populate("billboard");
        }
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }
        res.json(category);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch category", error: error.message });
    }
});

module.exports = router;
