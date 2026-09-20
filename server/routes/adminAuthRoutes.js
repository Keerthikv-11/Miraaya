const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const router = express.Router();

// ADMIN LOGIN
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required",
            });
        }

        const admin = await Admin.findOne({ email });

        if (!admin) {
            return res.status(401).json({
                message: "Invalid admin email or password",
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            admin.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid admin email or password",
            });
        }

        const token = jwt.sign(
            {
                adminId: admin._id,
                email: admin.email,
                role: "admin",
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d",
            }
        );

        res.json({
            message: "Admin login successful",
            token,
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
            },
        });
    } catch (error) {
        res.status(500).json({
            message: "Admin login failed",
            error: error.message,
        });
    }
});

module.exports = router;