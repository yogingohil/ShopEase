const Cart = require("../models/Cart");
const Product = require("../models/Product");
const asyncHandler = require("../utils/asyncHandler");
const { ApiError } = require("../middleware/errorHandler");

async function buildCartResponse(userId) {
  const cart = await Cart.findOne({ user: userId }).populate("items.product");
  if (!cart) return { items: [], subtotal: 0 };

  const items = cart.items
    .filter((item) => item.product)
    .map((item) => ({
      product: item.product,
      quantity: item.quantity,
      lineTotal: item.product.price * item.quantity
    }));

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  return { items, subtotal };
}

const getCart = asyncHandler(async (req, res) => {
  const cart = await buildCartResponse(req.user._id);
  res.json(cart);
});

const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, "Product not found.");
  if (product.stock < 1) throw new ApiError(400, "This product is out of stock.");

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = new Cart({ user: req.user._id, items: [] });

  const existing = cart.items.find((item) => item.product.toString() === productId);
  const desiredQty = (existing ? existing.quantity : 0) + Number(quantity);

  if (desiredQty > product.stock) {
    throw new ApiError(400, `Only ${product.stock} unit(s) of this product are available.`);
  }

  if (existing) {
    existing.quantity = desiredQty;
  } else {
    cart.items.push({ product: productId, quantity: desiredQty });
  }

  await cart.save();
  res.json(await buildCartResponse(req.user._id));
});

const updateCartItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, "Product not found.");
  if (quantity > product.stock) throw new ApiError(400, `Only ${product.stock} unit(s) available.`);

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) throw new ApiError(404, "Cart not found.");

  const item = cart.items.find((i) => i.product.toString() === productId);
  if (!item) throw new ApiError(404, "Item not in cart.");

  if (quantity <= 0) {
    cart.items = cart.items.filter((i) => i.product.toString() !== productId);
  } else {
    item.quantity = quantity;
  }

  await cart.save();
  res.json(await buildCartResponse(req.user._id));
});

const removeCartItem = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (cart) {
    cart.items = cart.items.filter((i) => i.product.toString() !== req.params.productId);
    await cart.save();
  }
  res.json(await buildCartResponse(req.user._id));
});

const clearCart = asyncHandler(async (req, res) => {
  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] }, { upsert: true });
  res.json({ items: [], subtotal: 0 });
});

module.exports = { getCart, addToCart, updateCartItem, removeCartItem, clearCart, buildCartResponse };
