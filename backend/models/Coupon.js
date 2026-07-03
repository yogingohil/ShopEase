const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String, trim: true },
    discountType: { type: String, enum: ["percentage", "flat"], default: "percentage" },
    discountValue: { type: Number, required: true, min: 0 },
    minOrderValue: { type: Number, default: 0 },
    maxDiscount: { type: Number },
    expiresAt: { type: Date },
    usageLimit: { type: Number, default: 0 },
    timesUsed: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    boundToUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

couponSchema.methods.isValid = function isValid(orderValue, userId) {
  if (!this.isActive) return { ok: false, reason: "Coupon is not active." };
  if (this.expiresAt && this.expiresAt < new Date()) return { ok: false, reason: "Coupon has expired." };
  if (this.usageLimit > 0 && this.timesUsed >= this.usageLimit) return { ok: false, reason: "Coupon usage limit reached." };
  if (orderValue < this.minOrderValue) return { ok: false, reason: `Minimum order value is ${this.minOrderValue}.` };
  if (this.boundToUser && String(this.boundToUser) !== String(userId)) {
    return { ok: false, reason: "This coupon code is not valid for your account." };
  }
  return { ok: true };
};

couponSchema.methods.calculateDiscount = function calculateDiscount(orderValue) {
  let discount = this.discountType === "percentage" ? (orderValue * this.discountValue) / 100 : this.discountValue;
  if (this.maxDiscount) discount = Math.min(discount, this.maxDiscount);
  return Math.min(discount, orderValue);
};

module.exports = mongoose.model("Coupon", couponSchema);
