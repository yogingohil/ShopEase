const express = require("express");
const { protect, requireRole } = require("../middleware/auth");
const { getDashboard, getCustomers } = require("../controllers/adminController");

const router = express.Router();

router.use(protect, requireRole("admin"));

router.get("/dashboard", getDashboard);
router.get("/customers", getCustomers);

module.exports = router;
