const Review = require("../models/Review");
const Product = require("../models/Product");
const Order = require("../models/Order");
const asyncHandler = require("../utils/asyncHandler");
const { ApiError } = require("../middleware/errorHandler");

async function recalculateRating(productId) {
  const stats = await Review.aggregate([
    { $match: { product: productId } },
    { $group: { _id: "$product", avgRating: { $avg: "$rating" }, count: { $sum: 1 } } }
  ]);
  const rating = stats[0]?.avgRating || 0;
  const numReviews = stats[0]?.count || 0;
  await Product.findByIdAndUpdate(productId, { rating: Math.round(rating * 10) / 10, numReviews });
}

const addReview = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { rating, comment } = req.body;

  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, "Product not found.");

  // Only customers who have actually ordered the product may review it.
  const hasPurchased = await Order.exists({
    user: req.user._id,
    "items.product": productId,
    status: { $ne: "cancelled" }
  });
  if (!hasPurchased) throw new ApiError(403, "You can only review products you have purchased.");

  const existing = await Review.findOne({ product: productId, user: req.user._id });
  if (existing) {
    existing.rating = rating;
    existing.comment = comment;
    await existing.save();
  } else {
    await Review.create({ product: productId, user: req.user._id, userName: req.user.name, rating, comment });
  }

  await recalculateRating(product._id);
  const reviews = await Review.find({ product: productId }).sort({ createdAt: -1 });
  res.status(201).json({ reviews });
});

const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.reviewId);
  if (!review) throw new ApiError(404, "Review not found.");
  if (review.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    throw new ApiError(403, "You cannot delete this review.");
  }
  const productId = review.product;
  await review.deleteOne();
  await recalculateRating(productId);
  res.json({ message: "Review deleted." });
});

module.exports = { addReview, deleteReview };
