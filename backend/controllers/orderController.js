const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Coupon = require("../models/Coupon");
const asyncHandler = require("../utils/asyncHandler");
const { ApiError } = require("../middleware/errorHandler");
const { buildCartResponse } = require("./cartController");

const placeOrder = asyncHandler(async (req, res) => {
  const { couponCode, shippingAddress, paymentMethod = "cod" } = req.body;

  const { items, subtotal } = await buildCartResponse(req.user._id);
  if (!items.length) throw new ApiError(400, "Your cart is empty.");

  // Re-validate stock at checkout time to avoid overselling.
  for (const item of items) {
    const fresh = await Product.findById(item.product._id);
    if (!fresh || fresh.stock < item.quantity) {
      throw new ApiError(400, `"${item.product.name}" no longer has enough stock.`);
    }
  }

  let discount = 0;
  let appliedCode;
  if (couponCode) {
    const coupon = await Coupon.findOne({ code: String(couponCode).toUpperCase() });
    if (!coupon) throw new ApiError(400, "Invalid coupon code.");
    const validity = coupon.isValid(subtotal, req.user._id);
    if (!validity.ok) throw new ApiError(400, validity.reason);
    discount = Math.round(coupon.calculateDiscount(subtotal));
    appliedCode = coupon.code;
    coupon.timesUsed += 1;
    await coupon.save();
  }

  const total = Math.max(0, subtotal - discount);

  // Mock payment gateway - simulates authorization without external calls.
  const paymentStatus = paymentMethod === "cod" ? "pending" : "paid";

  const order = await Order.create({
    user: req.user._id,
    customerName: req.user.name,
    customerEmail: req.user.email,
    items: items.map((item) => ({
      product: item.product._id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity
    })),
    subtotal,
    discount,
    couponCode: appliedCode,
    total,
    shippingAddress,
    paymentMethod,
    paymentStatus,
    status: "pending",
    statusHistory: [{ status: "pending" }]
  });

  // Decrement stock now that the order is confirmed.
  for (const item of items) {
    await Product.findByIdAndUpdate(item.product._id, { $inc: { stock: -item.quantity } });
  }

  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

  res.status(201).json({ order });
});

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ orders });
});

const getAllOrders = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = status ? { status } : {};
  const orders = await Order.find(filter).sort({ createdAt: -1 });
  res.json({ orders });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, "Order not found.");

  order.status = status;
  order.statusHistory.push({ status });
  if (status === "delivered" && order.paymentMethod === "cod") order.paymentStatus = "paid";
  if (status === "cancelled") {
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
    }
  }

  await order.save();
  res.json({ order });
});

module.exports = { placeOrder, getMyOrders, getAllOrders, updateOrderStatus };
