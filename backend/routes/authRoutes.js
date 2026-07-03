const express = require("express");
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const { protect } = require("../middleware/auth");
const {
  register,
  login,
  adminLogin,
  logout,
  me,
  updateProfile
} = require("../controllers/authController");

const router = express.Router();

router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required."),
    body("email").isEmail().withMessage("A valid email is required."),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters.")
  ],
  validate,
  register
);

router.post(
  "/login",
  [body("email").isEmail().withMessage("A valid email is required."), body("password").notEmpty()],
  validate,
  login
);

router.post(
  "/admin/login",
  [body("email").isEmail().withMessage("A valid email is required."), body("password").notEmpty()],
  validate,
  adminLogin
);

router.post("/logout", logout);
router.get("/me", protect, me);
router.patch("/me", protect, updateProfile);

module.exports = router;
