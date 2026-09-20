const express = require("express");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

const router = express.Router();

// Get user's cart
router.get("/:userId", async (req, res) => {
    try {
        let cart = await Cart.findOne({
            user: req.params.userId,
        }).populate("items.product");

        if (!cart) {
            cart = await Cart.create({
                user: req.params.userId,
                items: [],
            });
        }

        res.json(cart);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch cart",
            error: error.message,
        });
    }
});

// Add product to cart
router.post("/:userId/add", async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;

        if (!Number.isInteger(quantity) || quantity < 1) {
            return res.status(400).json({
                message: "Quantity must be at least 1",
            });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                message: "Product not found",
            });
        }

        if (!product.isAvailable || product.stock <= 0) {
            return res.status(400).json({
                message: "This product is currently out of stock",
            });
        }

        let cart = await Cart.findOne({
            user: req.params.userId,
        });

        if (!cart) {
            cart = new Cart({
                user: req.params.userId,
                items: [],
            });
        }

        const existingItem = cart.items.find(
            (item) => item.product.toString() === productId
        );

        if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;

            // Check total quantity against available stock
            if (newQuantity > product.stock) {
                return res.status(400).json({
                    message: `Only ${product.stock} item(s) available in stock`,
                });
            }

            existingItem.quantity = newQuantity;
        } else {
            // Check requested quantity against stock
            if (quantity > product.stock) {
                return res.status(400).json({
                    message: `Only ${product.stock} item(s) available in stock`,
                });
            }

            cart.items.push({
                product: productId,
                quantity,
            });
        }

        await cart.save();

        const updatedCart = await Cart.findById(cart._id).populate(
            "items.product"
        );

        res.json({
            message: "Product added to cart",
            cart: updatedCart,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to add product to cart",
            error: error.message,
        });
    }
});

// Update cart item quantity
router.put("/:userId/update/:productId", async (req, res) => {
    try {
        const { quantity } = req.body;

        if (!Number.isInteger(quantity) || quantity < 1) {
            return res.status(400).json({
                message: "Quantity must be at least 1",
            });
        }

        const cart = await Cart.findOne({
            user: req.params.userId,
        });

        if (!cart) {
            return res.status(404).json({
                message: "Cart not found",
            });
        }

        const item = cart.items.find(
            (item) =>
                item.product.toString() === req.params.productId
        );

        if (!item) {
            return res.status(404).json({
                message: "Product not found in cart",
            });
        }

        const product = await Product.findById(
            req.params.productId
        );

        if (!product) {
            return res.status(404).json({
                message: "Product not found",
            });
        }

        if (!product.isAvailable || product.stock <= 0) {
            return res.status(400).json({
                message: "This product is currently out of stock",
            });
        }

        // Check requested quantity against current stock
        if (quantity > product.stock) {
            return res.status(400).json({
                message: `Only ${product.stock} item(s) available in stock`,
            });
        }

        item.quantity = quantity;

        await cart.save();

        const updatedCart = await Cart.findById(cart._id).populate(
            "items.product"
        );

        res.json({
            message: "Cart updated",
            cart: updatedCart,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to update cart",
            error: error.message,
        });
    }
});

// Remove product from cart
router.delete("/:userId/remove/:productId", async (req, res) => {
    try {
        const cart = await Cart.findOne({
            user: req.params.userId,
        });

        if (!cart) {
            return res.status(404).json({
                message: "Cart not found",
            });
        }

        cart.items = cart.items.filter(
            (item) =>
                item.product.toString() !== req.params.productId
        );

        await cart.save();

        // Populate products before sending the response
        const updatedCart = await Cart.findById(cart._id).populate(
            "items.product"
        );

        res.json({
            message: "Product removed from cart",
            cart: updatedCart,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to remove product",
            error: error.message,
        });
    }
});

module.exports = router;