require("dotenv").config();
const connectDB = require("../config/db");
const User = require("../models/User");
const Product = require("../models/Product");
const Coupon = require("../models/Coupon");

const seedProducts = [
  { name: "Wireless Headphones", category: "Electronic Gadgets", price: 2499, stock: 18, imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80", description: "Comfortable Bluetooth headphones with clear sound and long battery life." },
  { name: "Classic Hoodie", category: "Clothes", price: 1299, stock: 32, imageUrl: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=80", description: "Soft cotton hoodie for daily wear, available in multiple sizes." },
  { name: "Desk Lamp", category: "Home Appliances", price: 899, stock: 24, imageUrl: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80", description: "Adjustable LED desk lamp with warm and cool light modes." },
  { name: "Training Shoes", category: "Footwear", price: 2199, stock: 14, imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80", description: "Lightweight shoes made for walking, running, and gym training." },
  { name: "Smart Watch", category: "Electronic Gadgets", price: 3499, stock: 20, imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80", description: "Fitness tracking smartwatch with heart-rate monitor and notification alerts." },
  { name: "Travel Backpack", category: "Clothes", price: 1599, stock: 26, imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80", description: "Durable backpack with laptop section and water-resistant fabric." },
  { name: "Daily Sunscreen", category: "Beauty", price: 499, stock: 40, imageUrl: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=900&q=80", description: "Lightweight SPF sunscreen for daily skin protection." },
  { name: "Yoga Mat", category: "Sports", price: 799, stock: 35, imageUrl: "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?auto=format&fit=crop&w=900&q=80", description: "Non-slip yoga mat for exercise, stretching, and home workouts." },
  { name: "Electric Kettle", category: "Home Appliances", price: 1199, stock: 16, imageUrl: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=900&q=80", description: "Fast-heating electric kettle with auto shut-off safety." },
  { name: "Modern Novel", category: "Books", price: 349, stock: 50, imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=900&q=80", description: "Paperback novel for everyday reading and gifting." },
  { name: "Bluetooth Speaker", category: "Electronic Gadgets", price: 1899, stock: 22, imageUrl: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=900&q=80", description: "Portable speaker with deep bass and splash-resistant design." },
  { name: "Cotton T-Shirt", category: "Clothes", price: 599, stock: 60, imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80", description: "Breathable cotton T-shirt suitable for daily casual wear." },
  { name: "Basmati Rice 5kg", category: "Grocery", price: 799, stock: 45, imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=900&q=80", description: "Premium long-grain basmati rice for daily meals and special dishes." },
  { name: "Cooking Oil 1L", category: "Grocery", price: 249, stock: 55, imageUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=900&q=80", description: "Refined cooking oil suitable for frying, sauteing, and everyday cooking." },
  { name: "Instant Coffee", category: "Grocery", price: 399, stock: 38, imageUrl: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=900&q=80", description: "Rich instant coffee powder for quick hot and cold coffee drinks." },
  { name: "Denim Jeans", category: "Clothes", price: 1499, stock: 28, imageUrl: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=900&q=80", description: "Comfort-fit denim jeans with classic styling for daily wear." },
  { name: "Casual Dress", category: "Clothes", price: 1799, stock: 18, imageUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=80", description: "Stylish casual dress for outings, events, and regular use." },
  { name: "Smartphone", category: "Electronic Gadgets", price: 15999, stock: 12, imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80", description: "Feature-rich smartphone with sharp display and fast performance." },
  { name: "Wireless Earbuds", category: "Electronic Gadgets", price: 1999, stock: 30, imageUrl: "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=900&q=80", description: "Compact true wireless earbuds with charging case and clear audio." },
  { name: "Running Shoes", category: "Footwear", price: 4499, stock: 15, imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80", description: "Sporty running shoes built for daily training and long runs." },
  { name: "Comfort Sandals", category: "Footwear", price: 899, stock: 34, imageUrl: "https://images.unsplash.com/photo-1603487742131-4160ec999306?auto=format&fit=crop&w=900&q=80", description: "Comfortable sandals for casual outdoor and daily use." },
  { name: "Mixer Grinder", category: "Home Appliances", price: 2999, stock: 4, imageUrl: "https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=900&q=80", description: "Powerful mixer grinder for chutney, masala, and kitchen preparation." },
  { name: "Steam Iron", category: "Home Appliances", price: 1299, stock: 3, imageUrl: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=900&q=80", description: "Steam iron with non-stick soleplate for neat wrinkle-free clothes." }
];

const seedCoupons = [
  { code: "WELCOME10", description: "10% off for new customers", discountType: "percentage", discountValue: 10, minOrderValue: 500, maxDiscount: 300 },
  { code: "FLAT100", description: "Flat Rs.100 off on orders above Rs.999", discountType: "flat", discountValue: 100, minOrderValue: 999 }
];

async function seed() {
  await connectDB();

  const adminEmail = (process.env.ADMIN_EMAIL || "admin@shop.com").toLowerCase();
  const adminExists = await User.findOne({ email: adminEmail });
  if (!adminExists) {
    await User.create({
      name: process.env.ADMIN_NAME || "Admin",
      email: adminEmail,
      password: process.env.ADMIN_PASSWORD || "admin123",
      role: "admin"
    });
    console.log(`Admin account created: ${adminEmail}`);
  } else {
    console.log("Admin account already exists, skipping.");
  }

  for (const item of seedProducts) {
    const exists = await Product.findOne({ name: item.name });
    if (!exists) await Product.create(item);
  }
  console.log(`Seeded ${seedProducts.length} products (existing ones were left untouched).`);

  for (const item of seedCoupons) {
    const exists = await Coupon.findOne({ code: item.code });
    if (!exists) await Coupon.create(item);
  }
  console.log("Seeded sample coupons: WELCOME10, FLAT100");

  console.log("Seeding complete.");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seeding failed:", error.message);
  process.exit(1);
});
