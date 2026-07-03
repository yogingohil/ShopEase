const Coupon = require("../models/Coupon");
const asyncHandler = require("../utils/asyncHandler");
const { ApiError } = require("../middleware/errorHandler");

const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.json({ coupons });
});

const createCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.create(req.body);
  res.status(201).json({ coupon });
});

const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!coupon) throw new ApiError(404, "Coupon not found.");
  res.json({ coupon });
});

const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);
  if (!coupon) throw new ApiError(404, "Coupon not found.");
  res.json({ message: "Coupon deleted." });
});

// Client-facing: check a coupon against the current cart subtotal without placing an order.
const validateCoupon = asyncHandler(async (req, res) => {
  const { code, orderValue } = req.body;
  const coupon = await Coupon.findOne({ code: String(code || "").toUpperCase() });
  if (!coupon) throw new ApiError(404, "Invalid coupon code.");

  const validity = coupon.isValid(Number(orderValue) || 0, req.user?._id);
  if (!validity.ok) throw new ApiError(400, validity.reason);

  const discount = Math.round(coupon.calculateDiscount(Number(orderValue) || 0));
  res.json({ code: coupon.code, discount, description: coupon.description });
});

module.exports = { getCoupons, createCoupon, updateCoupon, deleteCoupon, validateCoupon };
