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
const bannerRoutes = require("./routes/bannerRoutes");

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
app.use("/api/banners", bannerRoutes);

// Admin authentication
app.use("/api/admin/auth", adminAuthRoutes);

// Protected admin routes
app.use("/api/admin", adminRoutes);
app.use("/api/upload", uploadRoutes);

// ===============================
// MONGODB CONNECTION
// ===============================

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 3000 });
        console.log("MongoDB connected successfully!");
    } catch (error) {
        console.warn("Local MongoDB URI failed, connecting to In-Memory MongoDB...");
        try {
            const { MongoMemoryServer } = require("mongodb-memory-server");
            const mongoServer = await MongoMemoryServer.create();
            const uri = mongoServer.getUri();
            await mongoose.connect(uri);
            console.log("In-Memory MongoDB connected successfully!");
        } catch (memErr) {
            console.error("MongoDB connection failed completely:", memErr.message);
            return;
        }
    }

    try {
        const adminEmail = (process.env.ADMIN_EMAIL || "admin@miraaya.com").toLowerCase().trim();
        const adminPassword = process.env.ADMIN_PASSWORD || "MiraayaAdmin123";
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        const existingAdmin = await Admin.findOne({ email: adminEmail });

        if (!existingAdmin) {
            await Admin.create({
                name: "Miraaya Admin",
                email: adminEmail,
                password: hashedPassword,
            });
            console.log("Default Miraaya admin created successfully!");
        } else {
            existingAdmin.password = hashedPassword;
            await existingAdmin.save();
            console.log("Miraaya admin password synced successfully!");
        }
    } catch (adminErr) {
        console.error("Error creating/updating admin:", adminErr.message);
    }
};

connectDB();

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