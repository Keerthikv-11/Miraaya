const mongoose = require("mongoose");

const billboardSchema = new mongoose.Schema(
    {
        label: {
            type: String,
            required: true,
            trim: true,
        },
        subtitle: {
            type: String,
            default: "",
            trim: true,
        },
        imageUrl: {
            type: String,
            required: true,
        },
        ctaText: {
            type: String,
            default: "Shop Collection",
        },
        ctaLink: {
            type: String,
            default: "/category/sarees",
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Billboard", billboardSchema);
