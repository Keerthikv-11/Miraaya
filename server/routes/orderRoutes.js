const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Coupon = require("../models/Coupon");

const router = express.Router();

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});


// ============================================================
// COD ORDER
// ============================================================

// Create COD order from cart
router.post("/:userId", async (req, res) => {
    try {
        const { shippingAddress, couponCode } = req.body;

        const cart = await Cart.findOne({
            user: req.params.userId,
        }).populate("items.product");

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                message: "Cart is empty",
            });
        }

        let subtotal = 0;
        const orderItems = [];

        // Validate products and calculate subtotal
        for (const item of cart.items) {
            const product = item.product;

            if (!product) {
                return res.status(400).json({
                    message: "A product in the cart no longer exists",
                });
            }

            if (!product.isAvailable || product.stock <= 0) {
                return res.status(400).json({
                    message: `${product.name} is currently out of stock`,
                });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({
                    message: `${product.name} does not have enough stock`,
                });
            }

            subtotal += product.price * item.quantity;

            orderItems.push({
                product: product._id,
                name: product.name,
                price: product.price,
                quantity: item.quantity,
                image: product.image,
            });
        }

        // Shipping calculation
        const shippingAmount = subtotal >= 2000 ? 0 : 150;

        // Coupon calculation
        let discountAmount = 0;
        let appliedCouponCode = null;

        if (couponCode) {
            const coupon = await Coupon.findOne({
                code: couponCode.trim().toUpperCase(),
                isActive: true,
            });

            if (!coupon) {
                return res.status(400).json({
                    message: "Invalid or inactive coupon",
                });
            }

            // Check coupon expiry
            if (
                coupon.expiresAt &&
                new Date() > coupon.expiresAt
            ) {
                return res.status(400).json({
                    message: "This coupon has expired",
                });
            }

            // Check minimum order amount
            if (
                subtotal < coupon.minimumOrderAmount
            ) {
                return res.status(400).json({
                    message: `Minimum order amount for this coupon is ₹${coupon.minimumOrderAmount}`,
                });
            }

            // Percentage discount
            if (coupon.discountType === "percentage") {
                discountAmount =
                    (subtotal * coupon.discountValue) / 100;

                if (
                    coupon.maximumDiscount !== null &&
                    coupon.maximumDiscount !== undefined
                ) {
                    discountAmount = Math.min(
                        discountAmount,
                        coupon.maximumDiscount
                    );
                }
            }

            // Fixed discount
            else if (coupon.discountType === "fixed") {
                discountAmount = coupon.discountValue;
            }

            // Discount cannot exceed subtotal
            discountAmount = Math.min(
                discountAmount,
                subtotal
            );

            appliedCouponCode = coupon.code;
        }

        // Final amount
        const totalAmount =
            subtotal + shippingAmount - discountAmount;

        // Create COD order
        const order = await Order.create({
            user: req.params.userId,
            items: orderItems,
            subtotal,
            shippingAmount,
            couponCode: appliedCouponCode,
            discountAmount,
            totalAmount,
            shippingAddress,
            status: "Pending",

            // Payment information
            paymentMethod: "COD",
            paymentStatus: "Pending",
        });

        // Reduce stock
        for (const item of cart.items) {
            await Product.findByIdAndUpdate(
                item.product._id,
                {
                    $inc: {
                        stock: -item.quantity,
                    },
                }
            );
        }

        // Clear cart
        cart.items = [];
        await cart.save();

        res.status(201).json({
            message: "Order placed successfully",
            order,
        });
    } catch (error) {
        console.error("COD order error:", error);

        res.status(500).json({
            message: "Failed to place order",
            error: error.message,
        });
    }
});


// ============================================================
// RAZORPAY
// ============================================================

// Create Razorpay payment order
router.post("/:userId/payment", async (req, res) => {
    try {
        const { shippingAddress, couponCode } = req.body;

        const cart = await Cart.findOne({
            user: req.params.userId,
        }).populate("items.product");

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                message: "Cart is empty",
            });
        }

        let subtotal = 0;

        // Validate products and calculate subtotal
        for (const item of cart.items) {
            const product = item.product;

            if (!product) {
                return res.status(400).json({
                    message: "A product in the cart no longer exists",
                });
            }

            if (!product.isAvailable || product.stock <= 0) {
                return res.status(400).json({
                    message: `${product.name} is currently out of stock`,
                });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({
                    message: `${product.name} does not have enough stock`,
                });
            }

            subtotal += product.price * item.quantity;
        }

        // Shipping calculation
        const shippingAmount = subtotal >= 2000 ? 0 : 150;

        // Coupon calculation
        let discountAmount = 0;
        let appliedCouponCode = null;

        if (couponCode) {
            const coupon = await Coupon.findOne({
                code: couponCode.trim().toUpperCase(),
                isActive: true,
            });

            if (!coupon) {
                return res.status(400).json({
                    message: "Invalid or inactive coupon",
                });
            }

            // Check coupon expiry
            if (
                coupon.expiresAt &&
                new Date() > coupon.expiresAt
            ) {
                return res.status(400).json({
                    message: "This coupon has expired",
                });
            }

            // Check minimum order amount
            if (
                subtotal < coupon.minimumOrderAmount
            ) {
                return res.status(400).json({
                    message: `Minimum order amount for this coupon is ₹${coupon.minimumOrderAmount}`,
                });
            }

            // Percentage discount
            if (coupon.discountType === "percentage") {
                discountAmount =
                    (subtotal * coupon.discountValue) / 100;

                if (
                    coupon.maximumDiscount !== null &&
                    coupon.maximumDiscount !== undefined
                ) {
                    discountAmount = Math.min(
                        discountAmount,
                        coupon.maximumDiscount
                    );
                }
            }

            // Fixed discount
            else if (coupon.discountType === "fixed") {
                discountAmount = coupon.discountValue;
            }

            // Discount cannot exceed subtotal
            discountAmount = Math.min(
                discountAmount,
                subtotal
            );

            appliedCouponCode = coupon.code;
        }

        // Final amount
        const totalAmount =
            subtotal + shippingAmount - discountAmount;

        if (totalAmount <= 0) {
            return res.status(400).json({
                message: "Invalid order amount",
            });
        }

        // Razorpay requires amount in paise
        const razorpayOrder = await razorpay.orders.create({
            amount: Math.round(totalAmount * 100),
            currency: "INR",
            receipt: `miraaya_${Date.now()}`,
            notes: {
                userId: req.params.userId.toString(),
                couponCode: appliedCouponCode || "",
            },
        });

        res.status(201).json({
            message: "Payment order created successfully",

            razorpayOrderId: razorpayOrder.id,

            amount: razorpayOrder.amount,

            currency: razorpayOrder.currency,

            keyId: process.env.RAZORPAY_KEY_ID,

            orderDetails: {
                subtotal,
                shippingAmount,
                discountAmount,
                couponCode: appliedCouponCode,
                totalAmount,
                shippingAddress,
            },
        });
    } catch (error) {
        console.error(
            "Razorpay order creation error:",
            error
        );

        res.status(500).json({
            message: "Failed to create payment order",
            error: error.message,
        });
    }
});


// Verify Razorpay payment and create Miraaya order
router.post("/:userId/payment/verify", async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            shippingAddress,
            couponCode,
        } = req.body;

        if (
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature
        ) {
            return res.status(400).json({
                message: "Payment information is incomplete",
            });
        }

        // Create signature for verification
        const generatedSignature = crypto
            .createHmac(
                "sha256",
                process.env.RAZORPAY_KEY_SECRET
            )
            .update(
                `${razorpay_order_id}|${razorpay_payment_id}`
            )
            .digest("hex");

        // Compare signatures
        if (generatedSignature !== razorpay_signature) {
            return res.status(400).json({
                message: "Payment verification failed",
            });
        }

        const cart = await Cart.findOne({
            user: req.params.userId,
        }).populate("items.product");

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                message: "Cart is empty",
            });
        }

        let subtotal = 0;
        const orderItems = [];

        // Validate cart again before creating the order
        for (const item of cart.items) {
            const product = item.product;

            if (!product) {
                return res.status(400).json({
                    message: "A product in the cart no longer exists",
                });
            }

            if (!product.isAvailable || product.stock <= 0) {
                return res.status(400).json({
                    message: `${product.name} is currently out of stock`,
                });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({
                    message: `${product.name} does not have enough stock`,
                });
            }

            subtotal += product.price * item.quantity;

            orderItems.push({
                product: product._id,
                name: product.name,
                price: product.price,
                quantity: item.quantity,
                image: product.image,
            });
        }

        // Shipping calculation
        const shippingAmount = subtotal >= 2000 ? 0 : 150;

        // Coupon calculation
        let discountAmount = 0;
        let appliedCouponCode = null;

        if (couponCode) {
            const coupon = await Coupon.findOne({
                code: couponCode.trim().toUpperCase(),
                isActive: true,
            });

            if (!coupon) {
                return res.status(400).json({
                    message: "Invalid or inactive coupon",
                });
            }

            if (
                coupon.expiresAt &&
                new Date() > coupon.expiresAt
            ) {
                return res.status(400).json({
                    message: "This coupon has expired",
                });
            }

            if (
                subtotal < coupon.minimumOrderAmount
            ) {
                return res.status(400).json({
                    message: `Minimum order amount for this coupon is ₹${coupon.minimumOrderAmount}`,
                });
            }

            if (coupon.discountType === "percentage") {
                discountAmount =
                    (subtotal * coupon.discountValue) / 100;

                if (
                    coupon.maximumDiscount !== null &&
                    coupon.maximumDiscount !== undefined
                ) {
                    discountAmount = Math.min(
                        discountAmount,
                        coupon.maximumDiscount
                    );
                }
            } else if (coupon.discountType === "fixed") {
                discountAmount = coupon.discountValue;
            }

            discountAmount = Math.min(
                discountAmount,
                subtotal
            );

            appliedCouponCode = coupon.code;
        }

        const totalAmount =
            subtotal + shippingAmount - discountAmount;

        // Make sure Razorpay order amount matches our calculated amount
        const razorpayOrder =
            await razorpay.orders.fetch(razorpay_order_id);

        if (
            razorpayOrder.amount !==
            Math.round(totalAmount * 100)
        ) {
            return res.status(400).json({
                message: "Payment amount does not match order amount",
            });
        }

        // Create the actual Miraaya order
        const order = await Order.create({
            user: req.params.userId,
            items: orderItems,
            subtotal,
            shippingAmount,
            couponCode: appliedCouponCode,
            discountAmount,
            totalAmount,
            shippingAddress,
            status: "Confirmed",

            // Payment information
            paymentMethod: "Razorpay",
            paymentStatus: "Paid",
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature,
        });

        // Reduce stock only after successful payment
        for (const item of cart.items) {
            await Product.findByIdAndUpdate(
                item.product._id,
                {
                    $inc: {
                        stock: -item.quantity,
                    },
                }
            );
        }

        // Clear cart only after successful payment
        cart.items = [];
        await cart.save();

        res.status(201).json({
            message: "Payment verified and order placed successfully",
            order,
        });
    } catch (error) {
        console.error(
            "Razorpay payment verification error:",
            error
        );

        res.status(500).json({
            message: "Payment verification failed",
            error: error.message,
        });
    }
});


// ============================================================
// GET USER ORDERS
// ============================================================

// Get user's orders
router.get("/:userId", async (req, res) => {
    try {
        const orders = await Order.find({
            user: req.params.userId,
        })
            .populate("items.product")
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch orders",
            error: error.message,
        });
    }
});


// ============================================================
// GET SINGLE ORDER
// ============================================================

// Get single order
router.get("/:userId/:orderId", async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.orderId,
            user: req.params.userId,
        }).populate("items.product");

        if (!order) {
            return res.status(404).json({
                message: "Order not found",
            });
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch order",
            error: error.message,
        });
    }
});


module.exports = router;