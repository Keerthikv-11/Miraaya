const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
    {
        storeName: {
            type: String,
            default: "Miraaya Ethnic Wear",
        },
        announcementBarText: {
            type: String,
            default: "✨ Complimentary shipping across India on orders over ₹1,999",
        },
        announcementActive: {
            type: Boolean,
            default: true,
        },
        supportEmail: {
            type: String,
            default: "support@miraaya.com",
        },
        contactPhone: {
            type: String,
            default: "+91 98765 43210",
        },
        freeShippingThreshold: {
            type: Number,
            default: 1999,
        },
        flatShippingFee: {
            type: Number,
            default: 99,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Settings", settingsSchema);
