const express = require("express");
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const { protect, requireRole } = require("../middleware/auth");
const {
  getProducts,
  getCategories,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStock
} = require("../controllers/productController");
const { addReview, deleteReview } = require("../controllers/reviewController");

const router = express.Router();

const productValidation = [
  body("name").trim().notEmpty().withMessage("Product name is required."),
  body("category").notEmpty().withMessage("Category is required."),
  body("price").isFloat({ min: 0 }).withMessage("Price must be a positive number."),
  body("stock").isInt({ min: 0 }).withMessage("Stock must be a non-negative integer."),
  body("description").trim().notEmpty().withMessage("Description is required.")
];

router.get("/", getProducts);
router.get("/categories", getCategories);
router.get("/low-stock", protect, requireRole("admin"), getLowStock);
router.get("/:id", getProductById);

router.post("/", protect, requireRole("admin"), productValidation, validate, createProduct);
router.put("/:id", protect, requireRole("admin"), productValidation, validate, updateProduct);
router.delete("/:id", protect, requireRole("admin"), deleteProduct);

router.post(
  "/:productId/reviews",
  protect,
  requireRole("client"),
  [body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5.")],
  validate,
  addReview
);
router.delete("/:productId/reviews/:reviewId", protect, deleteReview);

module.exports = router;
