const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const couponRoutes = require("./routes/couponRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const adminRoutes = require("./routes/adminRoutes");
const adminAuthRoutes = require("./routes/adminAuthRoutes");
const Admin = require("./models/Admin");
const uploadRoutes = require("./routes/uploadRoutes");

const app = express();

// ===============================
// MIDDLEWARE
// ===============================

app.use(cors());
app.use(express.json());

// ===============================
// API ROUTES
// ===============================

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/reviews", reviewRoutes);

// Admin authentication
app.use("/api/admin/auth", adminAuthRoutes);

// Protected admin routes
app.use("/api/admin", adminRoutes);
app.use("/api/upload", uploadRoutes);

// ===============================
// MONGODB CONNECTION
// ===============================

mongoose
    .connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log("MongoDB connected successfully!");

        // Check whether admin already exists
        const existingAdmin = await Admin.findOne({
            email: process.env.ADMIN_EMAIL,
        });

        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash(
                process.env.ADMIN_PASSWORD,
                10
            );

            await Admin.create({
                name: "Miraaya Admin",
                email: process.env.ADMIN_EMAIL,
                password: hashedPassword,
            });

            console.log("Default Miraaya admin created successfully!");
        }
    })
    .catch((error) => {
        console.error(
            "MongoDB connection failed:",
            error.message
        );
    });

// ===============================
// TEST ROUTE
// ===============================

app.get("/", (req, res) => {
    res.json({
        message: "Miraaya backend is running successfully!",
    });
});

// ===============================
// SERVER
// ===============================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Miraaya server running on port ${PORT}`);
});