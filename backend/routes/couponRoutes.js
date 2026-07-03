const express = require("express");
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const { protect, requireRole } = require("../middleware/auth");
const {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon
} = require("../controllers/couponController");

const router = express.Router();

router.post("/validate", protect, requireRole("client"), validateCoupon);

router.use(protect, requireRole("admin"));
router.get("/", getCoupons);
router.post(
  "/",
  [
    body("code").trim().notEmpty().withMessage("Coupon code is required."),
    body("discountValue").isFloat({ min: 0 }).withMessage("Discount value must be a positive number.")
  ],
  validate,
  createCoupon
);
router.put("/:id", updateCoupon);
router.delete("/:id", deleteCoupon);

module.exports = router;
