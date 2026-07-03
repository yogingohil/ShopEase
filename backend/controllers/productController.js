const Product = require("../models/Product");
const Review = require("../models/Review");
const asyncHandler = require("../utils/asyncHandler");
const { ApiError } = require("../middleware/errorHandler");

// GET /api/products - supports search, category filter, price range, sort, pagination
const getProducts = asyncHandler(async (req, res) => {
  const {
    q,
    category,
    minPrice,
    maxPrice,
    sort = "newest",
    page = 1,
    limit = 12,
    inStock
  } = req.query;

  const filter = { isActive: true };

  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
      { category: { $regex: q, $options: "i" } }
    ];
  }
  if (category) filter.category = category;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }
  if (inStock === "true") filter.stock = { $gt: 0 };

  const sortMap = {
    newest: { createdAt: -1 },
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    rating: { rating: -1 },
    name: { name: 1 }
  };

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(48, Math.max(1, parseInt(limit, 10) || 12));

  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort(sortMap[sort] || sortMap.newest)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Product.countDocuments(filter)
  ]);

  res.json({
    products,
    pagination: {
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      limit: limitNum
    }
  });
});

const getCategories = asyncHandler(async (req, res) => {
  res.json({ categories: Product.CATEGORIES });
});

const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, "Product not found.");

  const reviews = await Review.find({ product: product._id }).sort({ createdAt: -1 });
  res.json({ product, reviews });
});

const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json({ product });
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!product) throw new ApiError(404, "Product not found.");
  res.json({ product });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw new ApiError(404, "Product not found.");
  await Review.deleteMany({ product: product._id });
  res.json({ message: "Product deleted." });
});

const getLowStock = asyncHandler(async (req, res) => {
  const products = await Product.find({
    isActive: true,
    $expr: { $lte: ["$stock", "$lowStockThreshold"] }
  }).sort({ stock: 1 });
  res.json({ products });
});

module.exports = {
  getProducts,
  getCategories,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStock
};
