const { GoogleGenAI } = require("@google/genai");

let ai = null;

function getAIInstance() {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("⚠️ GEMINI_API_KEY is not defined in environment variables. Gemini features will fail.");
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
}

/**
 * Sends a conversation to Gemini
 * @param {string} systemInstruction system instructions/persona
 * @param {Array} history previous message history formatted for Gemini API
 * @param {string} userMessage new message from user
 * @returns {Promise<string>} response text
 */
async function getGeminiResponse(systemInstruction, history, userMessage) {
  try {
    const aiInstance = getAIInstance();
    const contents = [];

    // Map history to Gemini format (role: 'user' or 'model', parts: [{ text: '...' }])
    if (history && Array.isArray(history)) {
      history.forEach((msg) => {
        contents.push({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content || msg.text || "" }],
        });
      });
    }

    // Add current user message
    contents.push({
      role: "user",
      parts: [{ text: userMessage }],
    });

    const response = await aiInstance.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return response.text || "";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to communicate with AI service: " + error.message);
  }
}

module.exports = { getGeminiResponse };
