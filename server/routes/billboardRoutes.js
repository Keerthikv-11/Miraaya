const express = require("express");
const Billboard = require("../models/Billboard");

const router = express.Router();

// GET all active billboards for public storefront
router.get("/", async (req, res) => {
    try {
        const billboards = await Billboard.find({ isActive: true }).sort({ createdAt: -1 });
        res.json(billboards);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch billboards", error: error.message });
    }
});

// GET single billboard
router.get("/:id", async (req, res) => {
    try {
        const billboard = await Billboard.findById(req.params.id);
        if (!billboard) {
            return res.status(404).json({ message: "Billboard not found" });
        }
        res.json(billboard);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch billboard", error: error.message });
    }
});

module.exports = router;
