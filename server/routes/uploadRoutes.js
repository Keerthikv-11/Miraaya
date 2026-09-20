const express = require("express");
const multer = require("multer");
const cloudinary = require("../utils/cloudinary");

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
});

router.post("/image", upload.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: "No image uploaded",
            });
        }

        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: "miraaya/products",
                    resource_type: "image",
                },
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                }
            );

            uploadStream.end(req.file.buffer);
        });

        res.json({
            message: "Image uploaded successfully",
            imageUrl: result.secure_url,
        });
    } catch (error) {
        console.error("Cloudinary upload error:", error);

        res.status(500).json({
            message: "Failed to upload image",
            error: error.message,
        });
    }
});

module.exports = router;