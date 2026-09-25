const express = require("express");
const Product = require("../models/Product");
const Order = require("../models/Order");
const User = require("../models/User");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

// Protect ALL admin routes
router.use(adminMiddleware);

// ===============================
// PRODUCTS
// ===============================

// Get all products for admin
router.get("/products", async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });

        res.json(products);
    } catch (error) {
        console.error("Admin products error:", error);

        res.status(500).json({
            message: "Failed to fetch products",
            error: error.message,
        });
    }
});

// Add product
router.post("/products", async (req, res) => {
    try {
        const product = await Product.create(req.body);

        res.status(201).json({
            message: "Product added successfully",
            product,
        });
    } catch (error) {
        console.error("Add product error:", error);

        res.status(400).json({
            message: "Failed to add product",
            error: error.message,
        });
    }
});

// Update product
router.put("/products/:id", async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );

        if (!product) {
            return res.status(404).json({
                message: "Product not found",
            });
        }

        res.json({
            message: "Product updated successfully",
            product,
        });
    } catch (error) {
        console.error("Update product error:", error);

        res.status(400).json({
            message: "Failed to update product",
            error: error.message,
        });
    }
});

// Delete product
router.delete("/products/:id", async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found",
            });
        }

        res.json({
            message: "Product deleted successfully",
        });
    } catch (error) {
        console.error("Delete product error:", error);

        res.status(500).json({
            message: "Failed to delete product",
            error: error.message,
        });
    }
});

// Update stock
router.put("/products/:id/stock", async (req, res) => {
    try {
        const { stock } = req.body;

        if (stock === undefined || Number(stock) < 0) {
            return res.status(400).json({
                message: "Stock must be 0 or greater",
            });
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            {
                stock: Number(stock),
                isAvailable: Number(stock) > 0,
            },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!product) {
            return res.status(404).json({
                message: "Product not found",
            });
        }

        res.json({
            message: "Stock updated successfully",
            product,
        });
    } catch (error) {
        console.error("Update stock error:", error);

        res.status(500).json({
            message: "Failed to update stock",
            error: error.message,
        });
    }
});


router.get("/orders", async (req, res) => {
    try {
        const orders = await Order.find()
            .populate("user", "name email")
            .populate("items.product")
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (error) {
        console.error("Admin orders error:", error);

        res.status(500).json({
            message: "Failed to fetch orders",
            error: error.message,
        });
    }
});

// Update order status
router.put("/orders/:id/status", async (req, res) => {
    try {
        const { status } = req.body;

        const allowedStatuses = [
            "Pending",
            "Confirmed",
            "Packed",
            "Shipped",
            "Delivered",
            "Cancelled",
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid order status",
            });
        }

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!order) {
            return res.status(404).json({
                message: "Order not found",
            });
        }

        res.json({
            message: "Order status updated successfully",
            order,
        });
    } catch (error) {
        console.error("Update order status error:", error);

        res.status(500).json({
            message: "Failed to update order status",
            error: error.message,
        });
    }
});

// ===============================
// DELETE ORDER
// ===============================

// Delete an order
router.delete("/orders/:id", async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);

        if (!order) {
            return res.status(404).json({
                message: "Order not found",
            });
        }

        res.json({
            message: "Order deleted successfully",
        });
    } catch (error) {
        console.error("Delete order error:", error);

        res.status(500).json({
            message: "Failed to delete order",
            error: error.message,
        });
    }
});

// ===============================
// CUSTOMERS
// ===============================

// Get all customers
router.get("/customers", async (req, res) => {
    try {
        const customers = await User.find()
            .select("name email createdAt")
            .sort({ createdAt: -1 });

        const customersWithStats = await Promise.all(
            customers.map(async (customer) => {
                const orders = await Order.find({
                    user: customer._id,
                }).select("totalAmount status");

                const totalSpent = orders
                    .filter((order) => order.status !== "Cancelled")
                    .reduce(
                        (total, order) =>
                            total + Number(order.totalAmount || 0),
                        0
                    );

                return {
                    _id: customer._id,
                    name: customer.name,
                    email: customer.email,
                    createdAt: customer.createdAt,
                    orderCount: orders.length,
                    totalSpent,
                };
            })
        );

        res.json(customersWithStats);
    } catch (error) {
        console.error("Admin customers error:", error);

        res.status(500).json({
            message: "Failed to fetch customers",
            error: error.message,
        });
    }
});

module.exports = router;