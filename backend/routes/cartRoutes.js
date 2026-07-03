const express = require("express");
const { protect, requireRole } = require("../middleware/auth");
const { getCart, addToCart, updateCartItem, removeCartItem, clearCart } = require("../controllers/cartController");

const router = express.Router();

router.use(protect, requireRole("client"));

router.get("/", getCart);
router.post("/items", addToCart);
router.patch("/items/:productId", updateCartItem);
router.delete("/items/:productId", removeCartItem);
router.delete("/", clearCart);

module.exports = router;
