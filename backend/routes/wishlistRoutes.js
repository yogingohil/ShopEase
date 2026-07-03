const express = require("express");
const { protect, requireRole } = require("../middleware/auth");
const { getWishlist, addToWishlist, removeFromWishlist } = require("../controllers/wishlistController");

const router = express.Router();

router.use(protect, requireRole("client"));

router.get("/", getWishlist);
router.post("/", addToWishlist);
router.delete("/:productId", removeFromWishlist);

module.exports = router;
