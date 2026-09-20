const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
        },

        discountType: {
            type: String,
            enum: ["percentage", "fixed"],
            required: true,
        },

        discountValue: {
            type: Number,
            required: true,
            min: 0,
        },

        minimumOrderAmount: {
            type: Number,
            default: 0,
            min: 0,
        },

        maximumDiscount: {
            type: Number,
            default: null,
        },

        isActive: {
            type: Boolean,
            default: true,
        },

        expiresAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Coupon", couponSchema);