const express = require("express");
const Banner = require("../models/Banner");
const router = express.Router();

// ============================================================
// PUBLIC ROUTES
// ============================================================

// Get all active banners for customer homepage
router.get("/", async (req, res) => {
    try {
        const banners = await Banner.find({ isActive: true }).sort({ createdAt: -1 });
        res.json(banners);
    } catch (error) {
        console.error("Error fetching banners:", error);
        res.status(500).json({ message: "Failed to fetch banners" });
    }
});

// ============================================================
// ADMIN ROUTES
// ============================================================

// Get all banners (active & inactive)
router.get("/admin/all", async (req, res) => {
    try {
        const banners = await Banner.find().sort({ createdAt: -1 });
        res.json(banners);
    } catch (error) {
        console.error("Error fetching admin banners:", error);
        res.status(500).json({ message: "Failed to fetch admin banners" });
    }
});

// Create new banner
router.post("/admin", async (req, res) => {
    try {
        const { title, subtitle, image, link, isActive } = req.body;

        if (!title || !image) {
            return res.status(400).json({ message: "Title and Image URL are required" });
        }

        const banner = await Banner.create({
            title,
            subtitle: subtitle || "",
            image,
            link: link || "/",
            isActive: isActive !== undefined ? isActive : true,
        });

        res.status(201).json({ message: "Banner created successfully", banner });
    } catch (error) {
        console.error("Error creating banner:", error);
        res.status(400).json({ message: "Failed to create banner", error: error.message });
    }
});

// Update banner
router.put("/admin/:id", async (req, res) => {
    try {
        const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!banner) {
            return res.status(404).json({ message: "Banner not found" });
        }

        res.json({ message: "Banner updated successfully", banner });
    } catch (error) {
        console.error("Error updating banner:", error);
        res.status(400).json({ message: "Failed to update banner", error: error.message });
    }
});

// Delete banner
router.delete("/admin/:id", async (req, res) => {
    try {
        const banner = await Banner.findByIdAndDelete(req.params.id);

        if (!banner) {
            return res.status(404).json({ message: "Banner not found" });
        }

        res.json({ message: "Banner deleted successfully" });
    } catch (error) {
        console.error("Error deleting banner:", error);
        res.status(500).json({ message: "Failed to delete banner", error: error.message });
    }
});

module.exports = router;
