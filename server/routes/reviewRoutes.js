const express = require("express");
const Review = require("../models/Review");
const Product = require("../models/Product");
const User = require("../models/User");

const router = express.Router();

/*
    GET all reviews for a product
    GET /api/reviews/product/:productId
*/
router.get("/product/:productId", async (req, res) => {
    try {
        const reviews = await Review.find({
            product: req.params.productId,
        })
            .populate("user", "name")
            .sort({ createdAt: -1 });

        const totalReviews = reviews.length;

        const averageRating =
            totalReviews === 0
                ? 0
                : reviews.reduce(
                    (total, review) => total + review.rating,
                    0
                ) / totalReviews;

        res.json({
            reviews,
            totalReviews,
            averageRating: Number(averageRating.toFixed(1)),
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch reviews",
            error: error.message,
        });
    }
});

/*
    ADD a review
    POST /api/reviews
*/
router.post("/", async (req, res) => {
    try {
        const {
            productId,
            userId,
            rating,
            comment,
        } = req.body;

        if (!productId || !userId || !rating || !comment) {
            return res.status(400).json({
                message: "Product, user, rating and comment are required",
            });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                message: "Rating must be between 1 and 5",
            });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                message: "Product not found",
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        const existingReview = await Review.findOne({
            product: productId,
            user: userId,
        });

        if (existingReview) {
            return res.status(400).json({
                message: "You have already reviewed this product",
            });
        }

        const review = await Review.create({
            product: productId,
            user: userId,
            rating,
            comment: comment.trim(),
        });

        const populatedReview = await Review.findById(
            review._id
        ).populate("user", "name");

        res.status(201).json({
            message: "Review added successfully",
            review: populatedReview,
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                message: "You have already reviewed this product",
            });
        }

        res.status(500).json({
            message: "Failed to add review",
            error: error.message,
        });
    }
});

/*
    DELETE a review
    DELETE /api/reviews/:reviewId
*/
router.delete("/:reviewId", async (req, res) => {
    try {
        const review = await Review.findById(
            req.params.reviewId
        );

        if (!review) {
            return res.status(404).json({
                message: "Review not found",
            });
        }

        await Review.findByIdAndDelete(
            req.params.reviewId
        );

        res.json({
            message: "Review deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to delete review",
            error: error.message,
        });
    }
});

module.exports = router;