const express = require("express");
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const { protect, requireRole } = require("../middleware/auth");
const { placeOrder, getMyOrders, getAllOrders, updateOrderStatus } = require("../controllers/orderController");

const router = express.Router();

router.post("/", protect, requireRole("client"), placeOrder);
router.get("/my", protect, requireRole("client"), getMyOrders);

router.get("/", protect, requireRole("admin"), getAllOrders);
router.patch(
  "/:id/status",
  protect,
  requireRole("admin"),
  [body("status").isIn(["pending", "confirmed", "shipped", "delivered", "cancelled"])],
  validate,
  updateOrderStatus
);

module.exports = router;
