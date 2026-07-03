const User = require("../models/User");
const Product = require("../models/Product");
const asyncHandler = require("../utils/asyncHandler");
const { ApiError } = require("../middleware/errorHandler");

const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate("wishlist");
  res.json({ wishlist: user.wishlist });
});

const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, "Product not found.");

  await User.findByIdAndUpdate(req.user._id, { $addToSet: { wishlist: productId } });
  const user = await User.findById(req.user._id).populate("wishlist");
  res.json({ wishlist: user.wishlist });
});

const removeFromWishlist = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { $pull: { wishlist: req.params.productId } });
  const user = await User.findById(req.user._id).populate("wishlist");
  res.json({ wishlist: user.wishlist });
});

module.exports = { getWishlist, addToWishlist, removeFromWishlist };
