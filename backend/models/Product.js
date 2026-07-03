const mongoose = require("mongoose");

const CATEGORIES = [
  "Grocery",
  "Clothes",
  "Electronic Gadgets",
  "Footwear",
  "Home Appliances",
  "Beauty",
  "Books",
  "Sports"
];

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120, index: true },
    slug: { type: String, unique: true, index: true },
    category: { type: String, required: true, enum: CATEGORIES },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    lowStockThreshold: { type: Number, default: 5 },
    imageUrl: { type: String, trim: true },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

productSchema.index({ name: "text", description: "text", category: "text" });

productSchema.pre("validate", function generateSlug(next) {
  if (this.name && (!this.slug || this.isModified("name"))) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") + "-" + Math.random().toString(36).slice(2, 7);
  }
  next();
});

productSchema.virtual("isLowStock").get(function isLowStock() {
  return this.stock <= this.lowStockThreshold;
});

productSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Product", productSchema);
module.exports.CATEGORIES = CATEGORIES;
