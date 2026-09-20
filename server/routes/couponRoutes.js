const express = require("express");
const Coupon = require("../models/Coupon");

const router = express.Router();

// Apply / validate a coupon
router.post("/apply", async (req, res) => {
    try {
        const { code, orderAmount } = req.body;

        if (!code) {
            return res.status(400).json({
                message: "Coupon code is required",
            });
        }

        if (orderAmount === undefined || orderAmount < 0) {
            return res.status(400).json({
                message: "Valid order amount is required",
            });
        }

        const coupon = await Coupon.findOne({
            code: code.trim().toUpperCase(),
            isActive: true,
        });

        if (!coupon) {
            return res.status(404).json({
                message: "Invalid or inactive coupon",
            });
        }

        // Check expiry
        if (coupon.expiresAt && new Date() > coupon.expiresAt) {
            return res.status(400).json({
                message: "This coupon has expired",
            });
        }

        // Check minimum order amount
        if (orderAmount < coupon.minimumOrderAmount) {
            return res.status(400).json({
                message: `Minimum order amount for this coupon is ₹${coupon.minimumOrderAmount}`,
            });
        }

        let discountAmount = 0;

        if (coupon.discountType === "percentage") {
            discountAmount =
                (orderAmount * coupon.discountValue) / 100;

            // Apply maximum discount if configured
            if (
                coupon.maximumDiscount !== null &&
                coupon.maximumDiscount !== undefined
            ) {
                discountAmount = Math.min(
                    discountAmount,
                    coupon.maximumDiscount
                );
            }
        } else {
            discountAmount = coupon.discountValue;
        }

        // Discount cannot exceed order amount
        discountAmount = Math.min(
            discountAmount,
            orderAmount
        );

        const finalAmount = orderAmount - discountAmount;

        res.json({
            message: "Coupon applied successfully",
            coupon: {
                code: coupon.code,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue,
            },
            discountAmount,
            finalAmount,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to apply coupon",
            error: error.message,
        });
    }
});

module.exports = router;