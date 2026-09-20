const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },

        name: {
            type: String,
            required: true,
        },

        price: {
            type: Number,
            required: true,
        },

        quantity: {
            type: Number,
            required: true,
            min: 1,
        },

        image: {
            type: String,
            default: "",
        },
    },
    {
        _id: false,
    }
);

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        items: {
            type: [orderItemSchema],
            required: true,
        },

        subtotal: {
            type: Number,
            required: true,
            min: 0,
        },

        shippingAmount: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
        },

        // Coupon used for this order
        couponCode: {
            type: String,
            default: null,
        },

        // Discount received from coupon
        discountAmount: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
        },

        totalAmount: {
            type: Number,
            required: true,
            min: 0,
        },

        status: {
            type: String,
            enum: [
                "Pending",
                "Confirmed",
                "Packed",
                "Shipped",
                "Delivered",
                "Cancelled",
            ],
            default: "Pending",
        },

        shippingAddress: {
            name: String,
            phone: String,
            address: String,
            city: String,
            state: String,
            pincode: String,
        },
    },
    {
        timestamps: true,
    }
);

// Prevent OverwriteModelError during nodemon restarts
module.exports =
    mongoose.models.Order || mongoose.model("Order", orderSchema);