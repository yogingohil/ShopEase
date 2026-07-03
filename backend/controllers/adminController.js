const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");

const getDashboard = asyncHandler(async (req, res) => {
  const [totalOrders, totalRevenueAgg, totalProducts, totalCustomers, lowStock, statusCounts, recentOrders, topProducts] =
    await Promise.all([
      Order.countDocuments(),
      Order.aggregate([
        { $match: { status: { $ne: "cancelled" } } },
        { $group: { _id: null, revenue: { $sum: "$total" } } }
      ]),
      Product.countDocuments({ isActive: true }),
      User.countDocuments({ role: "client" }),
      Product.find({ isActive: true, $expr: { $lte: ["$stock", "$lowStockThreshold"] } })
        .select("name stock lowStockThreshold")
        .limit(10),
      Order.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Order.find().sort({ createdAt: -1 }).limit(5).select("customerName total status createdAt"),
      Order.aggregate([
        { $match: { status: { $ne: "cancelled" } } },
        { $unwind: "$items" },
        { $group: { _id: "$items.name", unitsSold: { $sum: "$items.quantity" }, revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } } } },
        { $sort: { unitsSold: -1 } },
        { $limit: 5 }
      ])
    ]);

  // Revenue for the last 7 days, for a simple trend chart on the client.
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const dailyRevenue = await Order.aggregate([
    { $match: { createdAt: { $gte: sevenDaysAgo }, status: { $ne: "cancelled" } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        revenue: { $sum: "$total" },
        orders: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  res.json({
    totals: {
      orders: totalOrders,
      revenue: totalRevenueAgg[0]?.revenue || 0,
      products: totalProducts,
      customers: totalCustomers
    },
    lowStock,
    statusCounts: statusCounts.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
    recentOrders,
    topProducts,
    dailyRevenue
  });
});

const getCustomers = asyncHandler(async (req, res) => {
  const customers = await User.find({ role: "client" }).sort({ createdAt: -1 });
  res.json({ customers });
});

module.exports = { getDashboard, getCustomers };
