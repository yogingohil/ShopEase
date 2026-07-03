const { buildCartResponse } = require("./cartController");
const Coupon = require("../models/Coupon");
const { getGeminiResponse } = require("../utils/gemini");
const asyncHandler = require("../utils/asyncHandler");
const { ApiError } = require("../middleware/errorHandler");

const negotiatePrice = asyncHandler(async (req, res) => {
  const { history = [], userMessage } = req.body;

  if (!userMessage) {
    throw new ApiError(400, "User message is required.");
  }

  // 1. Fetch live cart to prevent payload tampering
  const { items, subtotal } = await buildCartResponse(req.user._id);
  if (!items.length) {
    throw new ApiError(400, "Your cart is empty. Add products to bargain.");
  }

  if (subtotal < 500) {
    throw new ApiError(400, "Minimum cart subtotal to bargain is ₹500.");
  }

  // Calculate turns
  const userTurns = history.filter((m) => m.role === "user").length + 1;
  const maxTurns = 5;

  // Build product list details for system prompt
  const productListStr = items
    .map((item) => `- ${item.product.name} (Qty: ${item.quantity}, Price: ₹${item.product.price})`)
    .join("\n");

  // Gupta Ji Persona System Prompt
  const systemInstruction = `
You are "Gupta Ji", the witty, experienced, and slightly dramatic store manager of ShopEase.
You speak in a blend of Hindi and English (Hinglish) with typical Indian seller phrases (e.g., "bhai sahab", "are yaar", "loss ho jayega", "pet pe laat").
Your goal is to bargain with the customer on their current cart.

Current Cart Contents:
${productListStr}
Original Subtotal: ₹${subtotal}

Negotiation State:
- This is Round ${userTurns} of ${maxTurns}.
- You can grant a maximum discount of 20% of the subtotal (maximum discount rate is 20%).
- If the user asks for a ridiculous discount (e.g., 30%, 50%), refuse dramatically and explain you'll go bankrupt.
- If the user is polite or makes a reasonable bid (e.g., 5% to 15% discount) AND it is Round 3 or later, you should accept it.
- If they reach Round ${maxTurns} (the final round), you must conclude the bargain. If they haven't agreed, offer a final discount of 15% to close the deal.

CRITICAL INSTRUCTIONS:
1. When you agree to a deal, you MUST append the token "[DEAL: XX]" to the end of your response, where XX is the agreed percentage discount (e.g., "[DEAL: 15]").
2. If you do not agree yet, do NOT append the "[DEAL: XX]" token. Suggest a counter-offer instead (e.g., "Chalo, 5% de sakta hoon").
3. Make sure to keep your response under 100 words.
4. Speak like a real local shopkeeper.
`;

  // Get response from Gemini
  const responseText = await getGeminiResponse(systemInstruction, history, userMessage);

  // Check if a deal was struck
  const dealRegex = /\[DEAL:\s*(\d+)\]/i;
  const match = responseText.match(dealRegex);

  if (match) {
    const discountPercent = Math.min(20, Math.max(1, parseInt(match[1], 10)));
    
    // Create user-locked coupon valid for 15 minutes
    const couponCode = `BARGAIN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min expiry

    const coupon = await Coupon.create({
      code: couponCode,
      description: `Bargain discount of ${discountPercent}% set by Gupta Ji`,
      discountType: "percentage",
      discountValue: discountPercent,
      minOrderValue: subtotal,
      expiresAt,
      usageLimit: 1,
      isActive: true,
      boundToUser: req.user._id,
    });

    // Remove the [DEAL: XX] token from the public response text
    const cleanedResponse = responseText.replace(dealRegex, "").trim();

    return res.json({
      dealSealed: true,
      discountPercent,
      couponCode: coupon.code,
      responseText: cleanedResponse,
      round: userTurns,
    });
  }

  // If final round is reached and no deal regex was triggered, force a 12% final deal
  if (userTurns >= maxTurns) {
    const finalPercent = 12;
    const couponCode = `BARGAIN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    const coupon = await Coupon.create({
      code: couponCode,
      description: `Bargain discount of ${finalPercent}% set by Gupta Ji`,
      discountType: "percentage",
      discountValue: finalPercent,
      minOrderValue: subtotal,
      expiresAt,
      usageLimit: 1,
      isActive: true,
      boundToUser: req.user._id,
    });

    return res.json({
      dealSealed: true,
      discountPercent: finalPercent,
      couponCode: coupon.code,
      responseText: responseText + "\n\nChalo bhai, bohot bargaining ho gayi! Ab last 12% de raha hoon, le lo!",
      round: userTurns,
    });
  }

  res.json({
    dealSealed: false,
    responseText,
    round: userTurns,
  });
});

module.exports = { negotiatePrice };
