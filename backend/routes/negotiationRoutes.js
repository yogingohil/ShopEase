const express = require("express");
const { protect, requireRole } = require("../middleware/auth");
const { negotiatePrice } = require("../controllers/negotiationController");

const router = express.Router();

router.use(protect, requireRole("client"));

router.post("/", negotiatePrice);

module.exports = router;
