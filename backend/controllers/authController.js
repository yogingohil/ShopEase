const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const { ApiError } = require("../middleware/errorHandler");
const { signToken, sendTokenCookie, clearTokenCookie } = require("../utils/token");

const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw new ApiError(409, "An account with this email already exists.");

  const user = await User.create({ name, email, password, phone, role: "client" });
  const token = signToken(user);
  sendTokenCookie(res, token);

  res.status(201).json({ user: user.toSafeObject(), token });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Invalid email or password.");
  }
  if (!user.isActive) throw new ApiError(403, "This account has been disabled.");

  user.lastLoginAt = new Date();
  await user.save();

  const token = signToken(user);
  sendTokenCookie(res, token);

  res.json({ user: user.toSafeObject(), token });
});

const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase(), role: "admin" }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Invalid admin email or password.");
  }

  user.lastLoginAt = new Date();
  await user.save();

  const token = signToken(user);
  sendTokenCookie(res, token);

  res.json({ user: user.toSafeObject(), token });
});

const logout = asyncHandler(async (req, res) => {
  clearTokenCookie(res);
  res.json({ message: "Logged out." });
});

const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user.toSafeObject() });
});

const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, address } = req.body;
  if (name) req.user.name = name;
  if (phone !== undefined) req.user.phone = phone;
  if (address) req.user.address = address;
  await req.user.save();
  res.json({ user: req.user.toSafeObject() });
});

module.exports = { register, login, adminLogin, logout, me, updateProfile };
