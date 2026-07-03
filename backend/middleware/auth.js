const jwt = require("jsonwebtoken");
const User = require("../models/User");

function getTokenFromRequest(req) {
  const cookieName = process.env.COOKIE_NAME || "shopease_token";
  if (req.cookies && req.cookies[cookieName]) return req.cookies[cookieName];
  const header = req.headers.authorization || "";
  if (header.startsWith("Bearer ")) return header.slice(7);
  return null;
}

async function protect(req, res, next) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return res.status(401).json({ message: "Not authenticated. Please log in." });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) return res.status(401).json({ message: "Session is no longer valid." });

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired session. Please log in again." });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "You do not have permission to perform this action." });
    }
    next();
  };
}

module.exports = { protect, requireRole };
