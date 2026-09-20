const express = require("express");
const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");

const router = express.Router();

// Get user's wishlist
router.get("/:userId", async (req, res) => {
    try {
        let wishlist = await Wishlist.findOne({
            user: req.params.userId,
        }).populate("products");

        // Create an empty wishlist if the user doesn't have one
        if (!wishlist) {
            wishlist = await Wishlist.create({
                user: req.params.userId,
                products: [],
            });

            wishlist = await Wishlist.findById(wishlist._id).populate(
                "products"
            );
        }

        res.json(wishlist);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch wishlist",
            error: error.message,
        });
    }
});

// Add product to wishlist
router.post("/:userId/add", async (req, res) => {
    try {
        const { productId } = req.body;

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                message: "Product not found",
            });
        }

        let wishlist = await Wishlist.findOne({
            user: req.params.userId,
        });

        if (!wishlist) {
            wishlist = new Wishlist({
                user: req.params.userId,
                products: [],
            });
        }

        // Don't add the same product twice
        const alreadyExists = wishlist.products.some(
            (id) => id.toString() === productId
        );

        if (alreadyExists) {
            return res.status(400).json({
                message: "Product already in wishlist",
            });
        }

        wishlist.products.push(productId);

        await wishlist.save();

        const updatedWishlist = await Wishlist.findById(
            wishlist._id
        ).populate("products");

        res.json({
            message: "Product added to wishlist",
            wishlist: updatedWishlist,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to add product to wishlist",
            error: error.message,
        });
    }
});

// Remove product from wishlist
router.delete("/:userId/remove/:productId", async (req, res) => {
    try {
        const wishlist = await Wishlist.findOne({
            user: req.params.userId,
        });

        if (!wishlist) {
            return res.status(404).json({
                message: "Wishlist not found",
            });
        }

        wishlist.products = wishlist.products.filter(
            (id) => id.toString() !== req.params.productId
        );

        await wishlist.save();

        const updatedWishlist = await Wishlist.findById(
            wishlist._id
        ).populate("products");

        res.json({
            message: "Product removed from wishlist",
            wishlist: updatedWishlist,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to remove product from wishlist",
            error: error.message,
        });
    }
});

module.exports = router;