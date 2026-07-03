const jwt = require("jsonwebtoken");

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d"
  });
}

function sendTokenCookie(res, token) {
  const cookieName = process.env.COOKIE_NAME || "shopease_token";
  const maxAgeDays = parseInt(process.env.JWT_EXPIRES_IN, 10) || 7;
  res.cookie(cookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: maxAgeDays * 24 * 60 * 60 * 1000
  });
}

function clearTokenCookie(res) {
  const cookieName = process.env.COOKIE_NAME || "shopease_token";
  res.clearCookie(cookieName);
}

module.exports = { signToken, sendTokenCookie, clearTokenCookie };
